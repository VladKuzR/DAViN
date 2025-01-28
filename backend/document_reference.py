from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
import logging

class DocumentReference:
    def __init__(self):
        self.division_map = {
            "Division 01 - General Requirements": "01",
            "Division 02 - Existing Conditions": "02",
            "Division 03 - Concrete": "03",
            "Division 04 - Masonry": "04",
            "Division 05 - Metals": "05",
            "Division 06 - Wood, Plastics, and Composites": "06",
            "Division 07 - Thermal and Moisture Protection": "07",
            "Division 08 - Openings": "08",
            "Division 09 - Finishes": "09",
            "Division 10 - Specialties": "10",
            "Division 11 - Equipment": "11",
            "Division 12 - Furnishings": "12",
            "Division 13 - Special Construction": "13",
            "Division 14 - Conveying Equipment": "14",
            "Division 21 - Fire Suppression": "21",
            "Division 22 - Plumbing": "22",
            "Division 23 - Heating Ventilating and Air Conditioning": "23",
            "Division 26 - Electrical": "26",
            "Division 27 - Communications": "27",
            "Division 28 - Electronic Safety and Security": "28",
            "Division 31 - Earthwork": "31",
            "Division 32 - Exterior Improvements": "32",
            "Division 33 - Utilities": "33"
        }
        
    def get_document_references(self, item_data):
        try:
            # Get Division field and handle if it's a list
            division = item_data.get('Division')
            if isinstance(division, list):
                division = division[0] if division else "00"  # Use first division if available
            elif division is None:
                division = "00"
                
            # Convert division to string and ensure 2 digits
            division = str(division).zfill(2)
            
            logging.debug(f"Processing division: {division}")
            
            # Generate document references
            specifications = f"Section {division}.00 - General Requirements"
            submittals = f"Submittal {division}.01 - Product Data"
            rfis = f"RFI {division}.02 - Installation Requirements"
            
            return {
                "specifications": specifications,
                "submittals": submittals,
                "rfis": rfis
            }
        except Exception as e:
            logging.error(f"Error processing document references: {e}")
            logging.debug(f"Item data: {item_data}")
            logging.debug(f"Division value: {division}, type: {type(division)}")
            return {
                "specifications": "Not Available",
                "submittals": "Not Available",
                "rfis": "Not Available"
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