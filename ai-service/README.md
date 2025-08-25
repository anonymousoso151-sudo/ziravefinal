# ZİRAVE AI Service

This is the AI service component of the ZİRAVE agricultural platform, built with FastAPI and Python.

## Features

- **Plant Disease Diagnosis** - AI-powered plant disease detection and identification
- **Image Processing** - Upload and analyze plant images for health assessment
- **Treatment Recommendations** - Provide actionable treatment and care recommendations
- **Agricultural Intelligence** - Seasonal and location-based farming advice

## Tech Stack

- **Framework:** FastAPI
- **Language:** Python 3.9+
- **AI/ML:** TensorFlow, PyTorch, OpenCV, scikit-learn
- **Image Processing:** Pillow, OpenCV
- **API Documentation:** Swagger/OpenAPI (auto-generated)

## Getting Started

### Prerequisites
- Python 3.9 or higher
- pip package manager

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
python main.py
```

The service will start on `http://localhost:8000`

API Documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Plant Diagnosis
- `POST /diagnose` - Diagnose plant issues from symptoms
- `POST /diagnose/image` - Diagnose from uploaded plant image

### Information
- `GET /plants/diseases` - Get known plant diseases database
- `GET /recommendations/types` - Get available recommendation types

## Request/Response Examples

### Text-based Diagnosis
```bash
curl -X POST "http://localhost:8000/diagnose" \
  -H "Content-Type: application/json" \
  -d '{
    "plant_type": "domates",
    "symptoms": ["yaprak sararması", "lekeler"],
    "location": "Antalya",
    "season": "yaz"
  }'
```

### Image-based Diagnosis
```bash
curl -X POST "http://localhost:8000/diagnose/image" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@plant_image.jpg" \
  -F "plant_type=domates"
```

## Development Status

Currently in **Phase 3.1** - Basic scaffolding and mock responses implemented.

### Current Features ✅
- FastAPI server setup
- Basic endpoint structure
- Mock diagnosis responses
- Image upload handling (placeholder)
- API documentation

### Planned Features 🔄
- Real AI model integration
- TensorFlow/PyTorch model loading
- Advanced image processing
- Disease classification algorithms
- Treatment recommendation engine
- Integration with agricultural databases

## Environment Variables

```bash
PORT=8000                    # Server port
AI_MODEL_PATH=/models        # Path to AI models
LOG_LEVEL=info              # Logging level
ENABLE_CORS=true            # Enable CORS for development
```

## Integration

This service integrates with:
- **NestJS Backend** - Via HTTP API calls
- **Mobile App** - Through backend proxy
- **Web Dashboard** - For admin and analytics

## Contributing

Follow the ZİRAVE development standards:
- Python PEP 8 style guide
- Type hints for all functions
- Comprehensive error handling
- API documentation with examples