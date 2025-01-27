from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

class DocumentReference:
    def __init__(self):
        self.division_map = {
            "Finishes": "09",
            "Steel": "05",
            "Openings": "08",
            "Plumbing": "22",
            "Thermal and Moisture Protection": "07",
            "Equipment": "11",
            "Concrete": "03"
        }
        
    def get_document_references(self, item_data: Dict) -> Dict[str, str]:
        """Get relevant document references and content for a construction item"""
        division = item_data['division']
        
        # Get division name from code
        division_name = next(
            (name for name, code in self.division_map.items() 
             if code == division.zfill(2)),
            "Unknown Division"
        )
        
        specs_content = self._get_division_specific_specs(division_name)
        submittals_content = self._get_division_specific_submittals(division_name)
        rfi_content = self._get_division_specific_rfis(division_name)
        
        return {
            'specifications': specs_content,
            'submittals': submittals_content,
            'rfis': rfi_content
        }
        
    def _get_division_specific_specs(self, division_name: str) -> str:
        specs = {
            "Concrete": """Concrete Specifications:
- Minimum compressive strength: 4000 PSI
- Reinforcement: A393 mesh
- Water-cement ratio: 0.45 max
- Air entrainment: 6% ±1%
- Slump range: 4" to 6\"""",
            
            "Steel": """Steel Specifications:
- Material grade: ASTM A992
- Connections: AISC pre-qualified
- Welding: AWS D1.1
- Surface prep: SSPC-SP6
- Coating: High-performance paint system""",
            
            "Plumbing": """Plumbing Specifications:
- Pipe material: PVC Schedule 40
- Joints: Solvent welded
- Pressure test: 100 PSI for 2 hours
- Slope: 1/4" per foot minimum
- Cleanouts: Every 100 feet""",
            # Add more divisions as needed
        }
        return specs.get(division_name, f"Generic specifications for {division_name}")
        
    def _get_division_specific_submittals(self, division_name: str) -> str:
        submittals = {
            "Concrete": """Required Submittals:
- Concrete mix design
- Reinforcement shop drawings
- Placement drawings
- Curing method
- Joint layout""",
            
            "Steel": """Required Submittals:
- Shop drawings
- Welding procedures
- Welder certifications
- Mill certificates
- Connection details""",
            
            "Plumbing": """Required Submittals:
- Product data sheets
- Installation details
- Pressure test reports
- Fixture cut sheets
- Isometric drawings""",
            # Add more divisions as needed
        }
        return submittals.get(division_name, f"Generic submittals for {division_name}")
        
    def _get_division_specific_rfis(self, division_name: str) -> str:
        rfis = {
            "Concrete": """Common RFIs:
- Foundation depth confirmation
- Reinforcement spacing clarification
- Cold weather procedures
- Joint locations
- Finish requirements""",
            
            "Steel": """Common RFIs:
- Connection detail clarifications
- Member sizing verification
- Bolt specification confirmation
- Paint system details
- Erection sequence""",
            
            "Plumbing": """Common RFIs:
- Pipe routing conflicts
- Fixture location confirmation
- Slope verification
- Connection details
- Access panel locations""",
            # Add more divisions as needed
        }
        return rfis.get(division_name, f"Generic RFIs for {division_name}") 