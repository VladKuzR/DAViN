import clr
import sys
import os
import comtypes.client
import time
import requests

# Add references to Navisworks API
NAVIS_PATH = r"C:\Program Files\Autodesk\Navisworks Manage 2025"
sys.path.append(NAVIS_PATH)

def open_navisworks_document(file_path):
    try:
        print(f"Attempting to open: {file_path}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"Error: File not found at {file_path}")
            return None
            
        # Register the COM server
        print("Registering COM server...")
        comtypes.client.GetModule(os.path.join(NAVIS_PATH, "Autodesk.Navisworks.Automation.dll"))
        
        # Create Navisworks application with specific version
        print("Creating Navisworks application...")
        app = comtypes.client.CreateObject("Navisworks.Application.25.0", dynamic=True)
        print("Created Navisworks application")
        
        # Wait for application to initialize
        time.sleep(2)
        
        # Open the document
        print("Opening file...")
        app.OpenFile(file_path)
        print("File opened successfully")
        
        # Get the document
        print("Getting document...")
        doc = app.ActiveDocument
        if doc is None:
            print("Failed to get document")
            return None
            
        print("Successfully got document")
        return app, doc
            
    except Exception as e:
        print(f"Error opening document: {e}")
        import traceback
        traceback.print_exc()
        return None

def create_or_get_layer(doc, layer_name):
    """Create a new layer or get existing one"""
    try:
        # Check if layer already exists
        layers = doc.Layers
        for layer in layers:
            if layer.DisplayName == layer_name:
                return layer
            
        # Create new layer if it doesn't exist
        new_layer = doc.Layers.Create(layer_name)
        return new_layer
        
    except Exception as e:
        print(f"Error creating/getting layer: {e}")
        return None

def get_phase_mappings():
    """Fetch phase mappings from API"""
    try:
        response = requests.get('http://localhost:8000/phase-mappings')
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching phase mappings: {e}")
        # Return default mappings as fallback
        return {
            "A393_SERVICE_PIT": "1",
            "S_A393_REIN": "1",
            "S_DEEP_FOUNDS": "1",
            "S_SHALLOW_FOUNDS": "1",
            "S_SERVICE_PIT": "1",
            "SERVICE_PIT": "1",
            "S_DPC": "1",
            "S_DPM": "1",
            "S_SAND_BLINDING": "1",
            "BLOCK_PARTITION": "2",
            "LINTELS": "2",
            "NOGGINS": "2"
        }

def assign_phases(doc):
    """Main function to assign phases to elements"""
    try:
        if not doc:
            print("No active document!")
            return
        
        # Get all model items
        search = doc.Models.RootItemDescendantsAndSelf
        
        # Get phase mappings from API
        phase_mappings = get_phase_mappings()
        
        # Track statistics
        processed_count = 0
        updated_count = 0
        error_count = 0
        
        # Process each model item
        for item in search:
            try:
                processed_count += 1
                item_name = item.DisplayName
                
                # Find matching phase
                for key, phase_number in phase_mappings.items():
                    if key in item_name:
                        # Create or get phase layer
                        layer_name = f"Phase {phase_number}"
                        layer = create_or_get_layer(doc, layer_name)
                        
                        if layer:
                            # Assign item to layer
                            item.Layer = layer
                            updated_count += 1
                            break
                        else:
                            error_count += 1
                        
            except Exception as e:
                error_count += 1
                print(f"Error processing item {item_name}: {e}")
        
        # Print summary
        print(f"\nProcess completed:")
        print(f"Total items processed: {processed_count}")
        print(f"Successfully updated: {updated_count}")
        print(f"Errors encountered: {error_count}")
        
    except Exception as e:
        print(f"Fatal error in assign_phases: {e}")

def main():
    """Entry point with error handling"""
    try:
        # Path to your Navisworks file
        nwf_path = r"C:\Users\Davin\davin\gatehouse_pub.nwd"
        
        print("Opening Navisworks document...")
        result = open_navisworks_document(nwf_path)
        if result is None:
            print("Failed to open document!")
            return
            
        app, doc = result
        print("Starting phase assignment process...")
        assign_phases(doc)
        
        # Save the document
        print("Saving document...")
        app.SaveFile(nwf_path)
        print("Changes saved!")
        
        # Close application
        app.Quit()
        print("Process completed!")
        
    except Exception as e:
        print(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 