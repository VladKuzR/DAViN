from openai import OpenAI
import os
from dotenv import load_dotenv
from typing import Optional, Dict, Any
from pydantic import BaseModel

# Load environment variables
load_dotenv()

class ConstructionInsight(BaseModel):
    item_key: str
    phase_number: str
    construction_details: str
    best_practices: str
    safety_considerations: str
    dependencies: str
    estimated_labor_hours: Optional[str]
    material_specifications: Optional[str]
    submittals: Optional[str]
    specifications: Optional[str]
    rfis: Optional[str]
    quality_control: Optional[str]
    photos_required: Optional[str]
    coordination_notes: Optional[str]

class ConstructionAIAgent:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
    def generate_construction_insight(self, item_data: Dict[str, Any]) -> ConstructionInsight:
        """Generate construction insights for a specific item"""
        
        # Create a prompt based on the item data
        prompt = f"""
        As a construction expert specializing in foundations, provide detailed information about the following foundation element:
        
        Item Details:
        - Key: {item_data.get('key', 'N/A')}
        - Phase: {item_data.get('phase_number', 'N/A')}
        - WBS Category: {item_data.get('wbs_category', 'N/A')}
        - Division: {item_data.get('division', 'N/A')}
        - Duration: {item_data.get('duration', 'N/A')} days
        - Predecessor: {item_data.get('predecessor', 'N/A')}
        - Start Date: {item_data.get('start_date', 'N/A')}
        - End Date: {item_data.get('end_date', 'N/A')}
        - Labor Hours: {item_data.get('labor', 'N/A')}
        
        Please provide comprehensive information in the following sections:

        1. Construction Process:
        - Excavation requirements and soil preparation
        - Reinforcement placement and details
        - Concrete specifications and pouring methods
        - Waterproofing and drainage considerations
        - Quality control checkpoints
        
        2. Required Submittals:
        - Shop drawings requirements
        - Product data submissions
        - Mix design approvals
        - Engineering calculations
        - Samples needed
        - Testing reports
        
        3. Specifications Reference:
        - Applicable specification sections
        - Key specification requirements
        - Testing requirements
        - Tolerance requirements
        - Referenced standards
        - Quality assurance requirements
        
        4. Potential RFIs:
        - Common RFI topics for this element
        - Critical clarifications needed
        - Typical design coordination issues
        - Specification clarifications
        - Construction method verifications
        
        5. Required Photos and Documentation:
        - Pre-installation documentation
        - Progress photo requirements
        - Quality control documentation
        - As-built documentation
        - Testing and inspection records
        
        6. Best Practices:
        - Site preparation requirements
        - Formwork and reinforcement guidelines
        - Concrete placement techniques
        - Curing and protection methods
        - Quality assurance measures
        
        7. Safety Considerations:
        - Excavation safety requirements
        - Fall protection needs
        - Concrete placement safety
        - Equipment operation guidelines
        - Required PPE
        
        8. Dependencies and Coordination:
        - Required site investigations
        - Utility coordination
        - Sequencing with other trades
        - Required inspections and approvals
        - Weather considerations
        
        9. Labor Requirements:
        - Crew composition
        - Specialized skills needed
        - Time estimates for each phase
        - Equipment operator requirements
        
        10. Material Specifications:
        - Concrete mix design requirements
        - Reinforcement specifications
        - Waterproofing materials
        - Drainage materials
        - Required testing and submittals

        Format the response in clear sections with detailed technical information.
        Focus on practical implementation and coordination requirements.
        Include specific callouts for critical quality control points.
        """
        
        # Get completion from OpenAI
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a construction expert with deep knowledge of building methods, safety requirements, and best practices."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Parse the response
        content = response.choices[0].message.content
        sections = content.split('\n\n')
        
        # Create ConstructionInsight object
        return ConstructionInsight(
            item_key=item_data.get('key', ''),
            phase_number=item_data.get('phase_number', ''),
            construction_details=self._extract_section(sections, "construction process"),
            submittals=self._extract_section(sections, "submittals"),
            specifications=self._extract_section(sections, "specifications"),
            rfis=self._extract_section(sections, "rfi"),
            photos_required=self._extract_section(sections, "photos"),
            best_practices=self._extract_section(sections, "best practices"),
            safety_considerations=self._extract_section(sections, "safety"),
            dependencies=self._extract_section(sections, "dependencies"),
            estimated_labor_hours=self._extract_section(sections, "labor"),
            material_specifications=self._extract_section(sections, "material"),
            quality_control=self._extract_section(sections, "quality"),
            coordination_notes=self._extract_section(sections, "coordination")
        )
    
    def _extract_section(self, sections: list, keyword: str) -> str:
        """Helper method to extract specific sections from the AI response"""
        for section in sections:
            if keyword.lower() in section.lower():
                return section.strip()
        return ""

    def chat_with_insight(self, insight: ConstructionInsight, user_message: str) -> str:
        """Chat with the AI about specific construction insights"""
        
        prompt = f"""
        You are a construction expert assistant. Use the following construction insight data to answer the user's question.
        Be specific and reference the data when possible.

        Construction Item Data:
        - Key: {insight.item_key}
        - Phase: {insight.phase_number}
        
        Available Information:
        - Construction Details: {insight.construction_details}
        - Best Practices: {insight.best_practices}
        - Safety Considerations: {insight.safety_considerations}
        - Dependencies: {insight.dependencies}
        - Labor Requirements: {insight.estimated_labor_hours}
        - Material Specifications: {insight.material_specifications}
        - Quality Control: {insight.quality_control}
        - Coordination Notes: {insight.coordination_notes}

        User Question: {user_message}

        Provide a clear, concise, and professional response focusing on the specific aspects mentioned in the question.
        """

        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a knowledgeable construction expert providing detailed technical information."},
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message.content 

    async def stream_chat_with_insight(self, insights, message):
        """Stream the chat response token by token"""
        try:
            # Initialize your LLM with streaming capability
            # This is an example - modify according to your actual LLM implementation
            async for token in self.client.stream(
                prompt=f"Context: {insights}\nQuestion: {message}\nAnswer: ",
                max_tokens=500
            ):
                yield token
        except Exception as e:
            logger.error(f"Error streaming chat response: {e}")
            raise 