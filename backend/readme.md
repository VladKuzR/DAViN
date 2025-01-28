# Assuming you're in the backend directory
echo "# DAViN Backend API

Backend service for the DAViN (Digital Asset Visualization Network) project, providing data analytics and visualization capabilities through a FastAPI application.

## Setup

### Prerequisites
- Python 3.8+
- pip (Python package installer)
- Airtable account with access to the project base

### Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd backend
\`\`\`

2. Create and activate a virtual environment:
\`\`\`bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
\`\`\`

3. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. Create a \`.env\` file in the backend directory:
\`\`\`
AIRTABLE_API_KEY=pat.your_api_key_here
\`\`\`

## Running the Server

Start the development server:
\`\`\`bash
python api_analytics.py
\`\`\`

The server will run at \`http://localhost:8000\`

## API Endpoints

### Analytics API
- **POST** \`/api/analytics\`
  - Retrieves filtered construction project data from Airtable
  - Request body:
    \`\`\`json
    {
      \"phase_range\": [0, 16],
      \"wbs_categories\": [
        \"Foundation\",
        \"Framing\",
        \"Roof / Exterior Finishes\"
      ],
      \"duration_range\": [0, 1]
    }
    \`\`\`
  - Response:
    \`\`\`json
    {
      \"results\": [
        {
          \"name\": \"string\",
          \"phase\": \"string\",
          \"wbs_category\": \"string\",
          \"duration\": 0,
          \"status\": \"string\",
          \"start_date\": \"string\",
          \"end_date\": \"string\",
          \"cost\": \"string\",
          \"labor\": \"string\"
        }
      ],
      \"count\": 0
    }
    \`\`\`

### WebSocket Connection
- **WS** \`/ws\`
  - Provides real-time updates for analytics data
  - Supports progress updates during long-running operations

## Project Structure

\`\`\`
backend/
├── .env                    # Environment variables
├── .venv/                  # Virtual environment
├── api_analytics.py        # Main FastAPI application
├── requirements.txt        # Python dependencies
└── README.md              # This file
\`\`\`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| AIRTABLE_API_KEY | Personal Access Token for Airtable API | Yes |

## Airtable Integration

The backend integrates with Airtable using the following configuration:
- Base ID: appuojNVDfs9U7ccy
- Table: BIM Layers (tbl60mtZmcPavvtQH)
- Required Fields:
  - Phase
  - WBS Category Level 1
  - Duration
  - Name
  - Status
  - Start Date
  - End Date
  - Cost
  - Labor

## Development

### Adding New Endpoints

1. Define new route in \`api_analytics.py\`
2. Add appropriate error handling
3. Update documentation
4. Test endpoint using tools like Postman or curl

### Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 422: Validation Error
- 502: Airtable API Error

## Testing

Run manual tests using curl:

\`\`\`bash
# Test analytics endpoint
curl -X POST http://localhost:8000/api/analytics \\
  -H \"Content-Type: application/json\" \\
  -d '{\"phase_range\":[0,16],\"wbs_categories\":[\"Foundation\"],\"duration_range\":[0,1]}'
\`\`\`

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]" > README.md