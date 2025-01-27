from fastapi import FastAPI, HTTPException
from airtable import Airtable
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import date
from construction_ai_agent import ConstructionAIAgent, ConstructionInsight
from procore_client import ProcoreClient

# Load environment variables
load_dotenv()

app = FastAPI()

# Initialize clients
airtable = Airtable(
    os.getenv('AIRTABLE_BASE_ID'),
    os.getenv('AIRTABLE_TABLE_NAME'),
    api_key=os.getenv('AIRTABLE_API_KEY')
)
ai_agent = ConstructionAIAgent()
procore_client = ProcoreClient()

class PhaseMapping(BaseModel):
    key: str
    phase_number: str
    division: str
    wbs_category: str
    duration: int
    percent_complete: float
    predecessor: Optional[str] = None
    start_date: date
    end_date: date
    labor: Optional[int] = None

class PhaseMappingResponse(PhaseMapping):
    id: str

class PhaseMappingWithInsights(PhaseMappingResponse):
    ai_insights: Optional[ConstructionInsight] = None

@app.get("/phase-mappings", response_model=List[PhaseMappingResponse])
async def get_phase_mappings():
    """
    Fetch all phase mappings from Airtable
    """
    try:
        records = airtable.get_all()
        return [
            PhaseMappingResponse(
                id=record['id'],
                **record['fields']
            )
            for record in records
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/phase-mappings/{record_id}/insights", response_model=ConstructionInsight)
async def get_construction_insights(record_id: str):
    """
    Get AI-generated construction insights for a specific phase mapping
    """
    try:
        # Get the record from Airtable
        record = airtable.get(record_id)
        if not record:
            raise HTTPException(status_code=404, detail="Phase mapping not found")
            
        # Generate insights using AI
        insights = ai_agent.generate_construction_insight(record['fields'])
        return insights
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/phase-mappings/{record_id}", response_model=PhaseMappingWithInsights)
async def get_phase_mapping(record_id: str, include_insights: bool = False):
    """
    Fetch a specific phase mapping by ID, optionally including AI insights
    """
    try:
        record = airtable.get(record_id)
        if not record:
            raise HTTPException(status_code=404, detail="Phase mapping not found")
            
        response = PhaseMappingWithInsights(
            id=record['id'],
            **record['fields']
        )
        
        if include_insights:
            insights = ai_agent.generate_construction_insight(record['fields'])
            response.ai_insights = insights
            
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/phase-mappings", response_model=PhaseMappingResponse)
async def add_phase_mapping(mapping: PhaseMapping):
    """
    Add a new phase mapping to Airtable
    """
    try:
        fields = mapping.dict()
        fields['start_date'] = fields['start_date'].isoformat()
        fields['end_date'] = fields['end_date'].isoformat()
        record = airtable.insert(fields)
        return PhaseMappingResponse(id=record['id'], **mapping.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/phase-mappings/{record_id}", response_model=PhaseMappingResponse)
async def update_phase_mapping(record_id: str, mapping: PhaseMapping):
    """
    Update an existing phase mapping
    """
    try:
        fields = mapping.dict()
        fields['start_date'] = fields['start_date'].isoformat()
        fields['end_date'] = fields['end_date'].isoformat()
        record = airtable.update(record_id, fields)
        return PhaseMappingResponse(id=record['id'], **mapping.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/phase-mappings/{record_id}")
async def delete_phase_mapping(record_id: str):
    """
    Delete a phase mapping
    """
    try:
        airtable.delete(record_id)
        return {"message": "Phase mapping deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/phase-mappings/{record_id}/sync-to-procore")
async def sync_to_procore(record_id: str, project_id: int):
    """
    Sync a phase mapping to Procore as a task
    """
    try:
        # Get the record from Airtable
        record = airtable.get(record_id)
        if not record:
            raise HTTPException(status_code=404, detail="Phase mapping not found")
            
        # Sync to Procore
        procore_task = procore_client.sync_airtable_to_procore(
            project_id,
            record['fields']
        )
        
        return {
            "message": "Successfully synced to Procore",
            "procore_task": procore_task
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/procore/projects")
async def get_procore_projects():
    """
    Get all projects from Procore
    """
    try:
        projects = procore_client.get_projects()
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/procore/projects/{project_id}/tasks")
async def get_procore_tasks(project_id: int):
    """
    Get all tasks for a Procore project
    """
    try:
        tasks = procore_client.get_tasks(project_id)
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 