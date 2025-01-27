from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from airtable import Airtable
from document_reference import DocumentReference
from construction_ai_agent import ConstructionAIAgent
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Initialize Airtable
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
AIRTABLE_TABLE_NAME = os.getenv("AIRTABLE_TABLE_NAME")

airtable = Airtable(AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, AIRTABLE_API_KEY)

# Pydantic models for request/response
class AnalyticsRequest(BaseModel):
    selected_divisions: List[str]
    phase_range: tuple[int, int]
    wbs_categories: List[str]
    duration_range: tuple[int, int]

class AnalyticsResponse(BaseModel):
    items: List[Dict]
    document_references: Dict[str, str]
    ai_insights: Dict[str, str]

@app.post("/api/analytics", response_model=AnalyticsResponse)
async def get_analytics(request: AnalyticsRequest):
    try:
        # 1. Build Airtable filter formula based on request parameters
        filter_formula = "AND("
        
        # Division filter
        division_conditions = []
        for division in request.selected_divisions:
            division_code = DocumentReference().division_map.get(division)
            if division_code:
                division_conditions.append(f"{{division}} = '{division_code}'")
        if division_conditions:
            filter_formula += f"OR({','.join(division_conditions)}),"
            
        # Phase range filter
        filter_formula += f"AND({{phase_number}} >= {request.phase_range[0]}, {{phase_number}} <= {request.phase_range[1]}),"
        
        # WBS category filter
        wbs_conditions = [f"{{wbs_category}} = '{cat}'" for cat in request.wbs_categories]
        if wbs_conditions:
            filter_formula += f"OR({','.join(wbs_conditions)}),"
            
        # Duration range filter
        filter_formula += f"AND({{duration}} >= {request.duration_range[0]}, {{duration}} <= {request.duration_range[1]})"
        
        filter_formula += ")"

        # 2. Query Airtable
        records = airtable.get_all(formula=filter_formula)
        
        # 3. Process each item through DocumentReference and AI
        processed_items = []
        doc_reference = DocumentReference()
        ai_agent = ConstructionAIAgent()
        
        for record in records:
            item_data = record['fields']
            
            # Get document references
            doc_refs = doc_reference.get_document_references(item_data)
            
            # Get AI insights
            ai_insights = ai_agent.analyze_construction_item(
                item_data,
                specifications=doc_refs['specifications'],
                submittals=doc_refs['submittals'],
                rfis=doc_refs['rfis']
            )
            
            processed_items.append({
                'item_data': item_data,
                'document_references': doc_refs,
                'ai_insights': ai_insights
            })
            
        return AnalyticsResponse(
            items=processed_items,
            document_references=doc_refs,
            ai_insights=ai_insights
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/divisions")
async def get_divisions():
    """Get available divisions"""
    try:
        doc_reference = DocumentReference()
        return {"divisions": list(doc_reference.division_map.keys())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/wbs-categories")
async def get_wbs_categories():
    """Get unique WBS categories from Airtable"""
    try:
        records = airtable.get_all(fields=['wbs_category'])
        categories = list(set(record['fields'].get('wbs_category') 
                            for record in records 
                            if 'wbs_category' in record['fields']))
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
