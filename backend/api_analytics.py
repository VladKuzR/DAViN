from fastapi import FastAPI, WebSocket, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Set
from airtable import Airtable
from document_reference import DocumentReference
from construction_ai_agent import ConstructionAIAgent
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging
import time  # Add this import at the top
from functools import lru_cache
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Store active WebSocket connections
active_connections: Set[WebSocket] = set()

# WebSocket connection handler
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        active_connections.remove(websocket)

# Helper function to send updates to all connected clients
async def broadcast_progress(message: str, progress: float = None):
    for connection in active_connections:
        try:
            await connection.send_json({
                "message": message,
                "progress": progress
            })
        except Exception as e:
            logger.error(f"Error broadcasting to client: {e}")
            active_connections.remove(connection)

# Configure retry strategy
retry_strategy = Retry(
    total=3,  # number of retries
    backoff_factor=1,  # wait 1, 2, 4 seconds between retries
    status_forcelist=[429, 500, 502, 503, 504]  # HTTP status codes to retry on
)

# Create a session with the retry strategy
session = requests.Session()
adapter = HTTPAdapter(
    max_retries=retry_strategy,
    pool_connections=10,
    pool_maxsize=10
)
session.mount("https://", adapter)
session.timeout = 30  # Set timeout for all requests

# After load_dotenv()
logger.info("Environment variables:")
logger.info(f"AIRTABLE_BASE_ID: {os.getenv('AIRTABLE_BASE_ID')}")
logger.info(f"AIRTABLE_TABLE_NAME: {os.getenv('AIRTABLE_TABLE_NAME')}")
if os.getenv('AIRTABLE_API_KEY'):
    logger.info("AIRTABLE_API_KEY: [Present]")
else:
    logger.info("AIRTABLE_API_KEY: [Missing]")

# Initialize Airtable with environment variables and error checking
airtable_base_id = "appuojNVDfs9U7ccy"
airtable_table_name = "tbl60mtZmcPavvtQH"  # BIM Layers table
airtable_api_key = os.getenv('AIRTABLE_API_KEY')

# Field names exactly as they appear in Airtable
AIRTABLE_PHASE_FIELD = "Phase"
AIRTABLE_WBS_FIELD = "WBS Category Level 1"
AIRTABLE_DURATION_FIELD = "Duration"

# Test direct API access first
try:
    headers = {
        'Authorization': f'Bearer {airtable_api_key}',
        'Content-Type': 'application/json'
    }
    
    # Test endpoint
    test_url = f"https://api.airtable.com/v0/{airtable_base_id}/{airtable_table_name}"
    
    logger.info(f"Testing connection to Airtable...")
    logger.info(f"URL: {test_url}")
    logger.info(f"API Key starts with: {airtable_api_key[:10]}...")
    
    response = requests.get(
        test_url,
        headers=headers,
        params={'maxRecords': 1}
    )
    
    # Log the full response for debugging
    logger.info(f"Response Status Code: {response.status_code}")
    logger.info(f"Response Headers: {response.headers}")
    logger.info(f"Response Body: {response.text[:500]}...")  # First 500 chars
    
    response.raise_for_status()
    
    data = response.json()
    logger.info("Successfully connected to Airtable!")
    logger.info(f"Retrieved {len(data.get('records', []))} records")
    
    # If we get here, the connection was successful
    # Now initialize the regular Airtable client
    airtable = Airtable(
        base_id=airtable_base_id,
        table_name=airtable_table_name,
        api_key=airtable_api_key
    )
    
    # Store airtable client in app state
    app.state.airtable = airtable
    logger.info("Airtable client initialized successfully")
    
    # Get the first record to see field names
    response = requests.get(
        f"https://api.airtable.com/v0/{airtable_base_id}/{airtable_table_name}",
        headers={
            'Authorization': f'Bearer {airtable_api_key}',
            'Content-Type': 'application/json'
        },
        params={'maxRecords': 1}
    )
    data = response.json()
    if 'records' in data and len(data['records']) > 0:
        fields = data['records'][0]['fields']
        logger.info("Available fields in Airtable:")
        for field_name in fields.keys():
            logger.info(f"  - {field_name}")
    
except Exception as e:
    logger.error(f"Error: {str(e)}")
    logger.error("Please verify:")
    logger.error("1. Your API key starts with 'pat.'")
    logger.error("2. You have access to the base")
    logger.error("3. The table ID is correct")
    logger.error("4. Your token has the correct permissions")
    raise

# After initial imports and before FastAPI setup
try:
    # Get metadata about the base
    meta_url = f"https://api.airtable.com/v0/meta/bases/{airtable_base_id}/tables"
    response = requests.get(
        meta_url,
        headers={
            'Authorization': f'Bearer {airtable_api_key}',
            'Content-Type': 'application/json'
        }
    )
    response.raise_for_status()
    tables_data = response.json()
    
    logger.info("\nAvailable tables in this base:")
    for table in tables_data.get('tables', []):
        logger.info(f"\nTable: {table.get('name')} (ID: {table.get('id')})")
        logger.info("Fields:")
        for field in table.get('fields', []):
            logger.info(f"  - {field.get('name')} (Type: {field.get('type')})")
            
except Exception as e:
    logger.error(f"Error getting table metadata: {e}")
    raise

# Pydantic models for request/response
class AnalyticsRequest(BaseModel):
    selected_divisions: List[str]
    phase_range: tuple[int, int]
    wbs_categories: List[str]
    duration_range: tuple[int, int]

class AnalyticsResponse(BaseModel):
    items: List[Dict]
    document_references: Dict
    ai_insights: Dict
    processing_time: float

class ChatRequest(BaseModel):
    item_key: str
    message: str
    phase: str
    division: str
    wbs: str

# Add cache for AI insights
@lru_cache(maxsize=100)
def get_cached_ai_insights(item_key: str, phase: str, division: str, wbs: str):
    """Cache AI insights based on key item parameters"""
    ai_agent = ConstructionAIAgent()
    return ai_agent.generate_construction_insight({
        'key': item_key,
        'Phase': phase,
        'Division': division,
        'WBS Category Level 1': wbs
    })

@app.post("/analytics", response_model=AnalyticsResponse)
async def get_analytics(request: AnalyticsRequest, max_records: int = 3):
    try:
        start_time = time.time()
        await broadcast_progress("Starting analysis...", 0)
        
        # Build filter formula with correct field names
        filter_parts = []
        
        # Phase range filter (using Phase field)
        phase_filter = f"AND({{{AIRTABLE_PHASE_FIELD}}} >= '{request.phase_range[0]}', {{{AIRTABLE_PHASE_FIELD}}} <= '{request.phase_range[1]}')"
        filter_parts.append(phase_filter)
        
        # WBS Category filter (using exact field name)
        if request.wbs_categories:
            wbs_conditions = [
                f"{{{AIRTABLE_WBS_FIELD}}} = '{category}'"
                for category in request.wbs_categories
            ]
            wbs_filter = f"OR({','.join(wbs_conditions)})"
            filter_parts.append(wbs_filter)
        
        # Duration filter (using exact field name)
        duration_filter = f"AND({{{AIRTABLE_DURATION_FIELD}}} >= {request.duration_range[0]}, {{{AIRTABLE_DURATION_FIELD}}} <= {request.duration_range[1]})"
        filter_parts.append(duration_filter)
        
        # Combine all filters
        filter_formula = f"AND({','.join(filter_parts)})"
        logger.info(f"Using filter formula: {filter_formula}")
        
        await broadcast_progress("Querying Airtable...", 0.1)
        
        try:
            records = airtable.get_all(
                formula=filter_formula,
                maxRecords=max_records
            )
        except requests.exceptions.Timeout:
            logging.error("Airtable request timed out")
            await broadcast_progress("Airtable request timed out. Please try again.", -1)
            raise HTTPException(status_code=504, detail="Airtable request timed out")
        except requests.exceptions.RequestException as e:
            logging.error(f"Airtable request failed: {e}")
            await broadcast_progress("Failed to fetch data from Airtable.", -1)
            raise HTTPException(status_code=502, detail="Failed to fetch data from Airtable")
            
        if not records:
            await broadcast_progress("No records found matching the criteria.", -1)
            return AnalyticsResponse(
                items=[],
                document_references={},
                ai_insights={},
                processing_time=time.time() - start_time
            )
            
        await broadcast_progress(f"Processing {len(records)} records...", 0.2)
        
        processed_items = []
        doc_reference = DocumentReference()
        
        for i, record in enumerate(records, 1):
            progress = 0.2 + (0.8 * (i / len(records)))
            await broadcast_progress(f"Processing record {i}/{len(records)}...", progress)
            
            try:
                item_data = record['fields']
                doc_refs = doc_reference.get_document_references(item_data)
                
                # Get AI insights using cache
                cache_key = (
                    item_data.get('key', ''),
                    str(item_data.get('Phase', '')),
                    str(item_data.get('Division', '')),
                    str(item_data.get('WBS Category Level 1', ''))
                )
                
                ai_insights = get_cached_ai_insights(*cache_key)
                
                processed_item = {
                    'item_data': item_data,
                    'document_references': doc_refs,
                    'ai_insights': ai_insights.model_dump()
                }
                processed_items.append(processed_item)
                
            except Exception as e:
                logging.error(f"Error processing record {i}: {e}")
                continue
        
        total_time = time.time() - start_time
        await broadcast_progress("Analysis complete!", 1.0)
        
        if not processed_items:
            return AnalyticsResponse(
                items=[],
                document_references={},
                ai_insights={},
                processing_time=total_time
            )
        
        return AnalyticsResponse(
            items=processed_items,
            document_references=processed_items[-1]['document_references'],
            ai_insights=processed_items[-1]['ai_insights'],
            processing_time=total_time
        )
            
    except Exception as e:
        logging.error("Error in get_analytics: %s", str(e), exc_info=True)
        await broadcast_progress(f"Error: {str(e)}", -1)
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

@app.get("/api/test")
async def test_endpoint():
    return {"status": "ok", "message": "API is working"}

@app.get("/api/test-airtable")
async def test_airtable_connection():
    """Test the Airtable connection"""
    try:
        records = airtable.get_all(maxRecords=1)
        return {"status": "success", "message": "Successfully connected to Airtable"}
    except Exception as e:
        logger.error(f"Airtable connection test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        # Get cached insights first
        insights = get_cached_ai_insights(
            request.item_key,
            request.phase,
            request.division,
            request.wbs
        )
        
        # Initialize AI agent
        ai_agent = ConstructionAIAgent()
        
        # Get chat response
        response = ai_agent.chat_with_insight(insights, request.message)
        
        return {"response": response}
    except Exception as e:
        logging.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
