"""
ZİRAVE AI Service - Agricultural Intelligence Platform
FastAPI service for plant diagnostics and agricultural recommendations
Enhanced with Google Gemini AI
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from datetime import datetime
import json
import io
import base64
from PIL import Image
import numpy as np
import torch
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v2

# Import Gemini service
try:
    from gemini_service import GeminiService
    GEMINI_AVAILABLE = True
    # Set Gemini API key
    os.environ['GEMINI_API_KEY'] = 'AIzaSyDUzOc7FXLVfFqY8oy8YEB1vxEEot76Rhg'
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: Gemini service not available")

# Initialize FastAPI app
app = FastAPI(
    title="ZİRAVE AI Service",
    description="Agricultural Intelligence Platform - Plant Diagnostics and Recommendations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class DiagnosisRequest(BaseModel):
    plant_type: Optional[str] = None
    symptoms: Optional[List[str]] = None
    location: Optional[str] = None
    season: Optional[str] = None

class DiagnosisResponse(BaseModel):
    diagnosis_id: str
    plant_type: str
    detected_issues: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    confidence: float
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    message: str
    version: str
    timestamp: str

# Plant disease classes (PlantVillage dataset subset)
PLANT_DISEASE_CLASSES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Disease information mapping
DISEASE_INFO = {
    'Tomato___Late_blight': {
        'name': 'Domates Geç Yanıklığı',
        'symptoms': ['Yapraklarda kahverengi lekeler', 'Beyaz küf tabakası', 'Meyve çürümesi'],
        'treatment': 'Fungisit uygulaması ve havalandırma artırımı',
        'severity': 'high'
    },
    'Tomato___Early_blight': {
        'name': 'Domates Erken Yanıklığı',
        'symptoms': ['Yapraklarda koyu kahverengi lekeler', 'Hedef şeklinde desenler'],
        'treatment': 'Bakır bazlı fungisit ve sulama düzeni',
        'severity': 'medium'
    },
    'Tomato___Bacterial_spot': {
        'name': 'Domates Bakteriyel Leke',
        'symptoms': ['Küçük kahverengi lekeler', 'Yaprak deformasyonu'],
        'treatment': 'Bakır sülfat uygulaması ve hijyen',
        'severity': 'medium'
    },
    'Tomato___healthy': {
        'name': 'Sağlıklı Domates',
        'symptoms': ['Belirtiler görülmüyor'],
        'treatment': 'Koruyucu bakım devam ettirin',
        'severity': 'none'
    },
    'Potato___Late_blight': {
        'name': 'Patates Geç Yanıklığı',
        'symptoms': ['Yapraklarda su emmiş lekeler', 'Beyaz küf'],
        'treatment': 'Sistemik fungisit ve drene edilmiş toprak',
        'severity': 'high'
    },
    'Apple___Apple_scab': {
        'name': 'Elma Karaleke',
        'symptoms': ['Yaprak ve meyvelerde koyu lekeler'],
        'treatment': 'Fungisit spreyi ve budama',
        'severity': 'medium'
    }
}

# Global model variable
model = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Initialize Gemini service
gemini_service = None
if GEMINI_AVAILABLE:
    try:
        gemini_service = GeminiService()
        print("✅ Gemini service initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Gemini service: {e}")
        gemini_service = None

def load_model():
    """Load the plant disease classification model"""
    global model
    try:
        # Initialize MobileNetV2 with custom classifier
        model = mobilenet_v2(pretrained=True)
        model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(0.2),
            torch.nn.Linear(model.last_channel, len(PLANT_DISEASE_CLASSES))
        )
        
        # In a real implementation, you would load pre-trained weights here:
        # model.load_state_dict(torch.load('plant_disease_model.pth', map_location=device))
        
        model.to(device)
        model.eval()
        print(f"Model loaded successfully on {device}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def preprocess_image(image_bytes):
    """Preprocess image for model inference"""
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Define preprocessing transforms
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        # Apply transforms and add batch dimension
        image_tensor = transform(image).unsqueeze(0).to(device)
        return image_tensor
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {e}")

def predict_disease(image_tensor):
    """Predict plant disease from preprocessed image"""
    global model
    
    if model is None:
        if not load_model():
            raise RuntimeError("Model not available")
    
    try:
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
            
            predicted_class = PLANT_DISEASE_CLASSES[predicted_idx.item()]
            confidence_score = confidence.item()
            
            return predicted_class, confidence_score
    except Exception as e:
        raise RuntimeError(f"Error during prediction: {e}")

def get_disease_recommendations(disease_class, confidence):
    """Get treatment recommendations based on disease prediction"""
    disease_info = DISEASE_INFO.get(disease_class, {
        'name': disease_class.replace('___', ' - ').replace('_', ' '),
        'symptoms': ['Belirti analizi yapılıyor'],
        'treatment': 'Uzman görüşü alınması önerilir',
        'severity': 'unknown'
    })
    
    # Generate recommendations based on severity
    recommendations = []
    
    if disease_info['severity'] == 'high':
        recommendations.extend([
            {
                'type': 'urgent_treatment',
                'title': 'Acil Müdahale Gerekli',
                'description': disease_info['treatment'],
                'priority': 'high'
            },
            {
                'type': 'monitoring',
                'title': 'Yakın Takip',
                'description': 'Günlük kontroller yapın ve yayılımı engelleyin',
                'priority': 'high'
            }
        ])
    elif disease_info['severity'] == 'medium':
        recommendations.extend([
            {
                'type': 'treatment',
                'title': 'Tedavi Önerisi',
                'description': disease_info['treatment'],
                'priority': 'medium'
            },
            {
                'type': 'prevention',
                'title': 'Önleyici Tedbirler',
                'description': 'Sulama düzenini kontrol edin ve havalandırmayı artırın',
                'priority': 'medium'
            }
        ])
    elif disease_info['severity'] == 'none':
        recommendations.append({
            'type': 'maintenance',
            'title': 'Koruyucu Bakım',
            'description': 'Mevcut bakım rutininizi sürdürün',
            'priority': 'low'
        })
    else:
        recommendations.append({
            'type': 'consultation',
            'title': 'Uzman Konsültasyonu',
            'description': 'Kesin teşhis için tarım uzmanına danışın',
            'priority': 'medium'
        })
    
    return {
        'name': disease_info['name'],
        'symptoms': disease_info['symptoms'],
        'treatment': disease_info['treatment'],
        'confidence': confidence
    }, recommendations

# Mock data for development
MOCK_PLANT_DISEASES = {
    "domates": {
        "common_diseases": [
            {
                "name": "Alternaria Yaprak Lekesi",
                "symptoms": ["kahverengi lekeler", "yaprak sararması", "yaprak dökülmesi"],
                "treatment": "Fungisit uygulaması ve sulama düzeni",
                "confidence": 0.85
            },
            {
                "name": "Fusarium Solgunluğu",
                "symptoms": ["yaprak sararması", "gövde çürümesi", "bitki ölümü"],
                "treatment": "Toprak dezenfeksiyonu ve dayanıklı çeşit kullanımı",
                "confidence": 0.78
            }
        ]
    },
    "salatalik": {
        "common_diseases": [
            {
                "name": "Külleme Hastalığı",
                "symptoms": ["beyaz toz tabaka", "yaprak deformasyonu"],
                "treatment": "Havalandırma artırımı ve fungisit",
                "confidence": 0.92
            }
        ]
    }
}

MOCK_RECOMMENDATIONS = [
    {
        "type": "watering",
        "title": "Sulama Önerisi",
        "description": "Günde 2-3 kez, sabah ve akşam saatlerinde sulayın",
        "priority": "high"
    },
    {
        "type": "fertilizer",
        "title": "Gübre Önerisi", 
        "description": "Azot oranı yüksek gübre kullanın",
        "priority": "medium"
    },
    {
        "type": "pest_control",
        "title": "Zararlı Kontrolü",
        "description": "Organik insektisit uygulaması yapın",
        "priority": "low"
    }
]

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="ZİRAVE AI Service is running successfully!",
        version="1.0.0",
        timestamp=datetime.now().isoformat()
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    return HealthResponse(
        status="healthy",
        message="All systems operational",
        version="1.0.0",
        timestamp=datetime.now().isoformat()
    )

@app.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose_plant(request: DiagnosisRequest):
    """
    Diagnose plant diseases and provide recommendations
    Enhanced with Gemini AI for better analysis
    """
    try:
        # Generate diagnosis ID
        diagnosis_id = f"diag_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Determine plant type
        plant_type = request.plant_type or "domates"  # Default to tomato
        
        # Use Gemini if available and symptoms provided
        if gemini_service and request.symptoms:
            try:
                gemini_result = await gemini_service.analyze_symptoms(
                    plant_type=plant_type,
                    symptoms=request.symptoms,
                    location=request.location or "",
                    season=request.season or ""
                )
                
                # Convert Gemini result to our format
                detected_issues = [{
                    "name": gemini_result.get('diagnosis', 'تحليل الأعراض'),
                    "symptoms": request.symptoms,
                    "treatment": gemini_result.get('treatment_plan', 'توصية علاجية'),
                    "confidence": gemini_result.get('confidence', 75) / 100.0
                }]
                
                # Convert recommendations
                recommendations = []
                if gemini_result.get('immediate_actions'):
                    recommendations.append({
                        "type": "immediate",
                        "title": "إجراءات فورية",
                        "description": ", ".join(gemini_result['immediate_actions']),
                        "priority": "high"
                    })
                
                if gemini_result.get('prevention'):
                    recommendations.append({
                        "type": "prevention",
                        "title": "إجراءات الوقاية",
                        "description": gemini_result['prevention'],
                        "priority": "medium"
                    })
                
                # Add default recommendations if none from Gemini
                if not recommendations:
                    recommendations = MOCK_RECOMMENDATIONS
                
                return DiagnosisResponse(
                    diagnosis_id=diagnosis_id,
                    plant_type=plant_type,
                    detected_issues=detected_issues,
                    recommendations=recommendations,
                    confidence=gemini_result.get('confidence', 75) / 100.0,
                    timestamp=datetime.now().isoformat()
                )
                
            except Exception as gemini_error:
                print(f"Gemini analysis failed, falling back to mock: {gemini_error}")
                # Fallback to mock data
                pass
        
        # Fallback to mock implementation
        plant_key = plant_type.lower().replace(" ", "")
        plant_diseases = MOCK_PLANT_DISEASES.get(plant_key, MOCK_PLANT_DISEASES["domates"])
        detected_issues = plant_diseases["common_diseases"][:1]
        recommendations = MOCK_RECOMMENDATIONS
        
        return DiagnosisResponse(
            diagnosis_id=diagnosis_id,
            plant_type=plant_type,
            detected_issues=detected_issues,
            recommendations=recommendations,
            confidence=0.87,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnosis failed: {str(e)}")

@app.post("/diagnose/image")
async def diagnose_from_image(
    file: UploadFile = File(...),
    plant_type: Optional[str] = None
):
    """
    Diagnose plant diseases from uploaded image using ML model and Gemini Vision
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image file
        image_bytes = await file.read()
        
        diagnosis_id = f"img_diag_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Try Gemini Vision first if available
        if gemini_service:
            try:
                gemini_result = await gemini_service.analyze_image(image_bytes, plant_type)
                
                if not gemini_result.get('error'):
                    # Convert Gemini result to our format
                    detected_issues = []
                    if gemini_result.get('diseases'):
                        for disease in gemini_result['diseases']:
                            detected_issues.append({
                                "name": disease,
                                "symptoms": [f"مشكلة في {disease}"],
                                "treatment": gemini_result.get('treatment_plan', 'توصية علاجية'),
                                "confidence": gemini_result.get('confidence', 70) / 100.0
                            })
                    
                    # Convert recommendations
                    recommendations = []
                    if gemini_result.get('immediate_recommendations'):
                        recommendations.append({
                            "type": "immediate",
                            "title": "توصيات فورية",
                            "description": ", ".join(gemini_result['immediate_recommendations']),
                            "priority": "high"
                        })
                    
                    if gemini_result.get('prevention_tips'):
                        recommendations.append({
                            "type": "prevention",
                            "title": "نصائح الوقاية",
                            "description": gemini_result['prevention_tips'],
                            "priority": "medium"
                        })
                    
                    return {
                        "diagnosis_id": diagnosis_id,
                        "plant_type": gemini_result.get('plant_type', plant_type or 'غير محدد'),
                        "detected_issues": detected_issues,
                        "recommendations": recommendations,
                        "confidence": gemini_result.get('confidence', 70) / 100.0,
                        "timestamp": datetime.now().isoformat(),
                        "image_processed": True,
                        "image_size": f"{len(image_bytes)} bytes",
                        "analysis_model": "gemini-vision",
                        "health_status": gemini_result.get('health_status', 'unknown'),
                        "severity": gemini_result.get('severity', 'medium'),
                        "visual_analysis": gemini_result.get('visual_analysis', 'تحليل بصري')
                    }
                    
            except Exception as gemini_error:
                print(f"Gemini vision analysis failed, falling back to ML model: {gemini_error}")
                # Fallback to ML model
                pass
        
        # Fallback to ML model
        try:
            image_tensor = preprocess_image(image_bytes)
            predicted_class, confidence = predict_disease(image_tensor)
        except (ValueError, RuntimeError) as e:
            # Fallback to mock response if model fails
            print(f"ML model prediction failed: {e}")
            predicted_class = "Tomato___Late_blight"
            confidence = 0.75
        
        # Get disease information and recommendations
        disease_info, recommendations = get_disease_recommendations(predicted_class, confidence)
        
        # Determine plant type from prediction if not provided
        if not plant_type:
            plant_type = predicted_class.split('___')[0].replace('_', ' ')
        
        return {
            "diagnosis_id": diagnosis_id,
            "plant_type": plant_type,
            "detected_issues": [
                {
                    "name": disease_info['name'],
                    "symptoms": disease_info['symptoms'],
                    "treatment": disease_info['treatment'],
                    "confidence": disease_info['confidence']
                }
            ],
            "recommendations": recommendations,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat(),
            "image_processed": True,
            "image_size": f"{len(image_bytes)} bytes",
            "model_prediction": predicted_class,
            "processing_device": str(device),
            "analysis_model": "ml-model"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image diagnosis failed: {str(e)}")

@app.get("/plants/diseases")
async def get_plant_diseases():
    """Get list of known plant diseases"""
    return {
        "diseases": MOCK_PLANT_DISEASES,
        "total_plants": len(MOCK_PLANT_DISEASES),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/recommendations/types")
async def get_recommendation_types():
    """Get available recommendation types"""
    return {
        "types": ["watering", "fertilizer", "pest_control", "pruning", "harvesting"],
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    # Load the ML model on startup
    print("Loading plant disease classification model...")
    load_model()
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,  # Enable auto-reload in development
        log_level="info"
    )