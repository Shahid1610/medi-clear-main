# HealthSense AI - Medical AI Assistant Application

A comprehensive health management platform with AI-powered symptom checking, medical record management, report analysis, and interactive health Q&A.

## Features

### 1. AI Symptom Checker
- Multi-step symptom input form
- AI-powered analysis using Google Gemini
- Urgency level assessment
- Possible condition identification
- Recommended tests and action items
- Warning signs and care recommendations

### 2. Medical Record Management
- Drag-and-drop file upload
- Support for PDF, JPG, PNG formats
- Automatic text extraction and OCR
- Structured medical value parsing
- Secure storage in Supabase

### 3. Report Analysis & Explanation
- AI-generated simple explanations
- Key findings with severity levels
- Overall health score calculation
- Risk level assessment
- Trend analysis over time
- Interactive charts and visualizations

### 4. Interactive Health Q&A Chat
- Context-aware chatbot
- References user's medical history
- Follow-up question suggestions
- Conversation history tracking
- Real-time responses

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Recharts for data visualization
- Lucide React for icons
- Vite for build tooling

### Backend
- FastAPI (Python)
- Pydantic for data validation
- Google Gemini AI for medical analysis
- PyMuPDF for PDF processing
- Pytesseract for OCR
- Supabase for database

### Database
- Supabase (PostgreSQL)
- Row Level Security enabled
- Complete schema for all features
- Optimized indexes

## Project Structure

```
healthsense-ai/
├── frontend/
│   ├── src/
│   │   ├── components/     # Shared components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   └── api/
│   │       └── v1/         # API endpoints
│   ├── data/               # File storage
│   ├── main.py            # FastAPI app
│   └── requirements.txt
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- Google Gemini API key

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=http://localhost:8000/api/v1
```

3. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Add your API keys to `.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

6. Start the server:
```bash
python main.py
```

The backend API will be available at `http://localhost:8000`

### Database Setup

The database schema has been automatically created in your Supabase instance. It includes:
- `medical_records` - Stores uploaded medical documents
- `symptom_assessments` - Stores symptom analysis results
- `report_explanations` - Stores AI-generated explanations
- `chat_sessions` - Stores chat conversations
- `chat_messages` - Stores individual chat messages

All tables have Row Level Security enabled to ensure data privacy.

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage

1. **Check Symptoms**: Navigate to Symptom Checker and describe your symptoms
2. **Upload Records**: Go to Upload Records and add your medical reports
3. **View Analysis**: Check Reports section for detailed analysis and trends
4. **Ask Questions**: Use the Health Chat to ask questions about your health

## Implementation Status

### Completed
- Full frontend UI with all pages and components
- Complete backend API structure with placeholder responses
- Database schema with all required tables
- RLS policies for secure data access
- Routing and navigation
- Responsive design
- Form validation
- Error handling

### To Implement (Marked with TODO in code)
1. **Gemini AI Integration**
   - Symptom analysis generation
   - Report explanation generation
   - Context-aware chat responses

2. **File Processing**
   - PDF text extraction
   - Image OCR processing
   - Medical value parsing

3. **Database Operations**
   - Supabase client integration
   - CRUD operations for all tables
   - Query optimization

4. **Additional Features**
   - User authentication
   - File storage management
   - Trend calculation algorithms
   - Health score computation

## Security Features

- Row Level Security on all database tables
- User isolation - users can only access their own data
- Secure file upload validation
- CORS configuration for API
- Environment variable protection

## Design Philosophy

The application follows modern design principles:
- Clean, professional interface
- Intuitive user experience
- Responsive layouts for all screen sizes
- Consistent color scheme and typography
- Smooth transitions and animations
- Clear visual hierarchy
- Accessible components

## Color Scheme

- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Neutral grays for backgrounds and text

## Contributing

When implementing the TODO items:
1. Follow the existing code structure
2. Maintain type safety with TypeScript
3. Add proper error handling
4. Update tests
5. Document new features

## License

This project is for educational and demonstration purposes.

## Support

For issues or questions:
1. Check the TODO comments in the code
2. Review the API documentation
3. Check backend/README.md for backend-specific details

## Acknowledgments

- Google Gemini AI for medical analysis
- Supabase for database and authentication
- FastAPI for backend framework
- React ecosystem for frontend tooling
