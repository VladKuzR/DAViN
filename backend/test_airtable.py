from airtable import Airtable
import os
from dotenv import load_dotenv
from pprint import pprint

# Load environment variables
load_dotenv()

# Get credentials
API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = os.getenv('AIRTABLE_BASE_ID')
TABLE_NAME = os.getenv('AIRTABLE_TABLE_NAME')

def test_airtable_wrapper():
    try:
        print("\nTesting Airtable wrapper...")
        print(f"Using Base ID: {BASE_ID}")
        print(f"Using Table Name: {TABLE_NAME}")
        
        # Initialize Airtable client
        airtable = Airtable(BASE_ID, TABLE_NAME, api_key=API_KEY)
        
        # 1. Get records (without view)
        print("\n1. Fetching records (without view):")
        records = airtable.get_all(maxRecords=3)
        print("First 3 records:")
        pprint(records)

        # 2. Insert a new record
        print("\n2. Creating a new record:")
        new_record = {
            "key": "TEST.1: API_TEST",
            "phase_number": "1",
            "division": "00",
            "wbs_category": "Test Category",
            "duration": 1,
            "percent_complete": 0,
            "start_date": "2024-02-01",
            "end_date": "2024-02-02",
            "labor": 3
        }
        created_record = airtable.insert(new_record)
        print("Created record:")
        pprint(created_record)
        
        # Store the record ID
        record_id = created_record['id']

        # 3. Update the record
        print("\n3. Updating the record:")
        updated_record = airtable.update(record_id, {
            "percent_complete": 50
        })
        print("Updated record:")
        pprint(updated_record)

        # 4. Delete the record
        print("\n4. Deleting the test record:")
        deleted = airtable.delete(record_id)
        print("Deleted record:")
        pprint(deleted)

        # 5. Demonstrate search functionality
        print("\n5. Searching records:")
        search_results = airtable.search('phase_number', '1')
        print("Records with phase_number '1':")
        pprint(search_results)

    except Exception as e:
        print(f"\nError: {str(e)}")
        print("\nPossible solutions:")
        print("1. Check if your API key is correct and has the right permissions")
        print("2. Verify the base ID and table name")
        print("3. Make sure you have access to this base")
        print("4. Check if you need to create a new API token at https://airtable.com/create/tokens")
        
        # Print more detailed error information
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print("\nDetailed error response:")
            print(e.response.text)

if __name__ == "__main__":
    test_airtable_wrapper() 