from procore_client import ProcoreClient
from pprint import pprint
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_procore_connection():
    try:
        print("\nTesting Procore Connection...")
        
        # Initialize client
        client = ProcoreClient()
        
        # Test authentication
        print("1. Testing Authentication...")
        token = client.authenticate()
        print(f"Authentication successful! Token received")
        
        # Test getting projects
        print("\n2. Getting Projects...")
        projects = client.get_projects()
        print(f"Found {len(projects)} projects:")
        for project in projects:
            print(f"- {project.get('name')} (ID: {project.get('id')})")
            
    except Exception as e:
        print(f"\nError: {str(e)}")
        print("\nPossible solutions:")
        print("1. Verify your Procore credentials in .env file")
        print("2. Make sure you have the correct client ID and secret")
        print("3. Check if your Procore account has API access")
        print("4. Verify the API endpoint URLs")

if __name__ == "__main__":
    test_procore_connection() 