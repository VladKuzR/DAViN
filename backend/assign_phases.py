import clr
clr.AddReference('RevitAPI')
clr.AddReference('RevitAPIUI')
from Autodesk.Revit.DB import *
from Autodesk.Revit.UI import *

def get_phase_by_number(doc, phase_number):
    # Get all phases in the project
    phases = FilteredElementCollector(doc).OfClass(Phase).ToElements()
    
    # Find phase with matching number/name
    for phase in phases:
        if str(phase_number) in phase.Name:
            return phase
    return None

def assign_phases():
    # Get current document
    doc = __revit__.ActiveUIDocument.Document
    
    # Start transaction
    with Transaction(doc, "Assign Phases") as t:
        t.Start()
        
        # Get all elements that can have phases
        all_elements = FilteredElementCollector(doc).WhereElementIsNotElementType()
        
        # Phase mapping based on element numbering
        phase_mappings = {
            # Foundation elements (Phase 1)
            "A393_SERVICE_PIT": 1,
            "S_A393_REIN": 1,
            "S_DEEP_FOUNDS": 1,
            "S_SHALLOW_FOUNDS": 1,
            "S_SERVICE_PIT": 1,
            "SERVICE_PIT": 1,
            "S_DPC": 1,
            "S_DPM": 1,
            "S_SAND_BLINDING": 1,
            
            # Framing elements (Phase 2)
            "BLOCK_PARTITION": 2,
            "LINTELS": 2,
            "NOGGINS": 2
        }
        
        # Process each element
        for element in all_elements:
            try:
                # Get element name/number
                element_name = element.Name
                
                # Find matching phase
                for key, phase_number in phase_mappings.items():
                    if key in element_name:
                        # Get phase
                        phase = get_phase_by_number(doc, phase_number)
                        if phase:
                            # Set phase parameter
                            param = element.get_Parameter(BuiltInParameter.PHASE_CREATED)
                            if param:
                                param.Set(phase.Id)
                        break
                        
            except Exception as e:
                print(f"Error processing element: {e}")
                
        t.Commit()

# Run the script
assign_phases() 