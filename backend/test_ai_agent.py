from construction_ai_agent import ConstructionAIAgent
from document_reference import DocumentReference
from pprint import pprint
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_ai_insights():
    # Create test construction item data
    test_item = {
        "key": "1.1: A393_SERVICE_PIT_E30",
        "phase_number": "1",
        "division": "03",
        "wbs_category": "Foundation",
        "duration": 5,
        "percent_complete": 0.0,
        "predecessor": None,
        "start_date": "2024-02-01",
        "end_date": "2024-02-06",
        "labor": 6,
        "submittal_status": "Pending",
        "rfi_count": 0,
        "inspection_required": True,
        "quality_level": "Critical",
        "weather_sensitive": True
    }

    try:
        print("\nTesting AI Construction Insights...")
        print(f"Analyzing item: {test_item['key']}")
        
        # Get document references
        doc_reference = DocumentReference()
        references = doc_reference.get_document_references(item_data=test_item)
        
        print("\nDocument References:")
        print("===================")
        for doc_type, content in references.items():
            if content:
                print(f"\n{doc_type.title()}:")
                print("-" * len(doc_type))
                print(content)
        
        # Initialize AI agent
        ai_agent = ConstructionAIAgent()
        
        # Get insights
        insights = ai_agent.generate_construction_insight(test_item)
        
        # Print results
        print("\nConstruction Insights:")
        print("=====================")
        
        sections = [
            ("Construction Details", insights.construction_details),
            ("Required Submittals", insights.submittals),
            ("Specifications", insights.specifications),
            ("Potential RFIs", insights.rfis),
            ("Required Photos", insights.photos_required),
            ("Best Practices", insights.best_practices),
            ("Safety Considerations", insights.safety_considerations),
            ("Dependencies", insights.dependencies),
            ("Labor Requirements", insights.estimated_labor_hours),
            ("Material Specifications", insights.material_specifications),
            ("Quality Control", insights.quality_control),
            ("Coordination Notes", insights.coordination_notes)
        ]
        
        for title, content in sections:
            if content:
                print(f"\n{title}:")
                print("-" * len(title))
                print(content)
        
    except Exception as e:
        print(f"\nError: {str(e)}")

if __name__ == "__main__":
    test_ai_insights() 