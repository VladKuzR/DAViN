# DAViN (Digital Asset Visualization Network)

DAViN is a comprehensive construction project analytics system that provides intelligent insights and visualization capabilities for construction project data. The system integrates with Airtable for data storage, OpenAI for AI-powered insights, and Procore for project management.

## System Architecture

### Backend (Python/FastAPI)
- FastAPI-based REST API with WebSocket support
- AI-powered construction insights using OpenAI GPT
- Integration with Airtable for data storage
- Integration with Procore for project management
- Real-time progress updates via WebSocket

### Frontend (Vanilla JavaScript)
- Modern, responsive UI with cyberpunk-inspired design
- Real-time data visualization
- Interactive filters for project analysis
- AI chat interface for construction insights
- Dynamic data loading and caching

## Features

- **Phase Analysis**: Filter and analyze construction phases
- **Division Management**: CSI division-based organization
- **WBS Categories**: Work Breakdown Structure categorization
- **Duration Tracking**: Track and analyze task durations
- **AI Insights**: Get intelligent insights about construction elements
- **Document References**: Automatic linking to relevant construction documents
- **Real-time Updates**: WebSocket-based progress updates
- **Interactive Chat**: AI-powered chat interface for construction queries

## Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- Airtable account
- OpenAI API key
- Procore account (optional)

### Backend Setup

1. Create and activate virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```


2. Install dependencies:

```bash
pip install -r requirements.txt
```


3. Create `.env` file:
```
env
AIRTABLE_API_KEY=your_key_here
AIRTABLE_BASE_ID=appuojNVDfs9U7ccy
AIRTABLE_TABLE_NAME=tbl60mtZmcPavvtQH
OPENAI_API_KEY=your_key_here
PROCORE_CLIENT_ID=your_id_here
PROCORE_CLIENT_SECRET=your_secret_here
```


4. Start the backend server:

```
bash
uvicorn api_analytics:app --reload
```


### Frontend Setup

1. Configure API endpoint:

```
javascript
// vanilla/services/config.js
const config = {
API_URL: 'http://localhost:8000',
AIRTABLE_API_KEY: 'your_key_here'
};
```


2. Start the frontend server:

```
bash
cd vanilla
python -m http.server 8080 # Or use any static file server
```


## API Endpoints

### Analytics API
- `POST /api/analytics`: Get construction analytics data
- `GET /api/divisions`: Get available CSI divisions
- `GET /api/wbs-categories`: Get WBS categories
- `POST /api/chat`: Chat with AI about construction insights

### WebSocket
- `ws://localhost:8000/ws`: Real-time progress updates

## Project Structure

```
.
├── backend/
│ ├── api_analytics.py # Main FastAPI application
│ ├── api_phases.py # Phase management API
│ ├── construction_ai_agent.py # AI integration
│ ├── document_reference.py # Document management
│ ├── procore_client.py # Procore integration
│ └── requirements.txt # Python dependencies
│
└── vanilla/
├── app.js # Main application logic
├── index.html # Frontend interface
├── styles.css # UI styling
└── services/
├── airtable.js # Airtable integration
└── config.js # Configuration
```


## Development

### Backend Development
- Uses FastAPI for API development
- Implements CORS middleware for cross-origin requests
- Includes comprehensive error handling
- Supports WebSocket for real-time updates

### Frontend Development
- Pure JavaScript/jQuery implementation
- Responsive design with CSS Grid
- Real-time data updates
- Interactive filtering system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license here]

## Authors

## Development

### Backend Development
- Uses FastAPI for API development
- Implements CORS middleware for cross-origin requests
- Includes comprehensive error handling
- Supports WebSocket for real-time updates

### Frontend Development
- Pure JavaScript/jQuery implementation
- Responsive design with CSS Grid
- Real-time data updates
- Interactive filtering system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license here]

## Authors

- [Vlad Kuznetsov](https://github.com/VladKuzR): Lead developer and architect of the DAViN project.
- [Alex Lazarev](https://github.com/a-laz): Frontend developer responsible for the UI design and implementation.
