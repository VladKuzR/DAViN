import os
import requests
from typing import Dict, List, Optional
from datetime import datetime
from dateutil import parser
from dotenv import load_dotenv
import mimetypes
import tempfile

# Load environment variables
load_dotenv()

class ProcoreDocument:
    def __init__(self, doc_data: Dict):
        self.id = doc_data.get('id')
        self.name = doc_data.get('name')
        self.url = doc_data.get('url')
        self.description = doc_data.get('description')
        self.created_at = doc_data.get('created_at')
        self.updated_at = doc_data.get('updated_at')
        self.content_type = doc_data.get('content_type')
        self.folder_path = doc_data.get('folder_path')

class ProcoreClient:
    def __init__(self):
        self.client_id = os.getenv('PROCORE_CLIENT_ID')
        self.client_secret = os.getenv('PROCORE_CLIENT_SECRET')
        self.base_url = "https://api.procore.com"
        self.access_token = None
        
    def authenticate(self):
        """Get OAuth2 access token"""
        auth_url = f"{self.base_url}/oauth/token"
        data = {
            'grant_type': 'client_credentials',
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        response = requests.post(auth_url, data=data)
        response.raise_for_status()
        
        self.access_token = response.json()['access_token']
        return self.access_token
        
    def get_headers(self):
        """Get headers with authentication"""
        if not self.access_token:
            self.authenticate()
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
    def get_projects(self) -> List[Dict]:
        """Get all projects"""
        url = f"{self.base_url}/rest/v1.0/projects"
        response = requests.get(url, headers=self.get_headers())
        response.raise_for_status()
        return response.json()
        
    def get_tasks(self, project_id: int) -> List[Dict]:
        """Get all tasks for a project"""
        url = f"{self.base_url}/rest/v1.0/projects/{project_id}/tasks"
        response = requests.get(url, headers=self.get_headers())
        response.raise_for_status()
        return response.json()
        
    def create_task(self, project_id: int, task_data: Dict) -> Dict:
        """Create a new task in Procore"""
        url = f"{self.base_url}/rest/v1.0/projects/{project_id}/tasks"
        response = requests.post(url, headers=self.get_headers(), json=task_data)
        response.raise_for_status()
        return response.json()
        
    def update_task(self, project_id: int, task_id: int, task_data: Dict) -> Dict:
        """Update an existing task"""
        url = f"{self.base_url}/rest/v1.0/projects/{project_id}/tasks/{task_id}"
        response = requests.patch(url, headers=self.get_headers(), json=task_data)
        response.raise_for_status()
        return response.json()
        
    def sync_airtable_to_procore(self, project_id: int, airtable_record: Dict) -> Dict:
        """Sync an Airtable record to Procore task"""
        task_data = {
            'title': airtable_record['key'],
            'description': f"Phase: {airtable_record['phase_number']}\nWBS: {airtable_record['wbs_category']}",
            'start_date': airtable_record['start_date'],
            'end_date': airtable_record['end_date'],
            'completion_percentage': int(airtable_record['percent_complete'] * 100),
            'assignee_ids': [],  # Add assignee IDs if available
            'custom_fields': {
                'division': airtable_record['division'],
                'labor_hours': airtable_record.get('labor', 0)
            }
        }
        
        # Check if task already exists
        tasks = self.get_tasks(project_id)
        existing_task = next(
            (t for t in tasks if t['title'] == airtable_record['key']),
            None
        )
        
        if existing_task:
            return self.update_task(project_id, existing_task['id'], task_data)
        else:
            return self.create_task(project_id, task_data)

    def get_project_documents(self, project_id: int, folder_path: Optional[str] = None) -> List[ProcoreDocument]:
        """Get all documents in a project or specific folder"""
        url = f"{self.base_url}/rest/v1.0/projects/{project_id}/documents"
        params = {}
        if folder_path:
            params['folder_path'] = folder_path
            
        response = requests.get(url, headers=self.get_headers(), params=params)
        response.raise_for_status()
        
        return [ProcoreDocument(doc) for doc in response.json()]

    def search_documents(self, project_id: int, query: str) -> List[ProcoreDocument]:
        """Search for documents by keyword"""
        url = f"{self.base_url}/rest/v1.0/projects/{project_id}/documents/search"
        params = {'query': query}
        
        response = requests.get(url, headers=self.get_headers(), params=params)
        response.raise_for_status()
        
        return [ProcoreDocument(doc) for doc in response.json()]

    def get_specification_documents(self, project_id: int, division: str = None) -> List[ProcoreDocument]:
        """Get specification documents, optionally filtered by division"""
        specs_folder = "/Specifications"
        docs = self.get_project_documents(project_id, specs_folder)
        
        if division:
            return [doc for doc in docs if division in doc.name]
        return docs

    def get_submittal_documents(self, project_id: int, spec_section: str = None) -> List[ProcoreDocument]:
        """Get submittal documents, optionally filtered by specification section"""
        submittals_folder = "/Submittals"
        docs = self.get_project_documents(project_id, submittals_folder)
        
        if spec_section:
            return [doc for doc in docs if spec_section in doc.name]
        return docs

    def get_rfi_documents(self, project_id: int, rfi_number: str = None) -> List[ProcoreDocument]:
        """Get RFI documents, optionally filtered by RFI number"""
        rfis_folder = "/RFIs"
        docs = self.get_project_documents(project_id, rfis_folder)
        
        if rfi_number:
            return [doc for doc in docs if rfi_number in doc.name]
        return docs

    def download_document(self, project_id: int, document_id: int, save_path: str = None) -> str:
        """Download a document and return its path"""
        url = f"{self.base_url}/rest/v1.0/projects/{project_id}/documents/{document_id}/download"
        response = requests.get(url, headers=self.get_headers(), stream=True)
        response.raise_for_status()
        
        # Determine file extension from content type
        content_type = response.headers.get('content-type')
        ext = mimetypes.guess_extension(content_type) or '.pdf'
        
        # Create temp file if no save path provided
        if not save_path:
            temp_dir = tempfile.gettempdir()
            save_path = os.path.join(temp_dir, f"procore_doc_{document_id}{ext}")
        
        # Save the file
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        return save_path

    def get_relevant_documents(self, project_id: int, item_data: Dict) -> Dict[str, List[ProcoreDocument]]:
        """Get all relevant documents for a construction item"""
        division = item_data.get('division')
        spec_section = f"Section {division}"
        
        return {
            'specifications': self.get_specification_documents(project_id, division),
            'submittals': self.get_submittal_documents(project_id, spec_section),
            'rfis': self.get_rfi_documents(project_id)
        } 