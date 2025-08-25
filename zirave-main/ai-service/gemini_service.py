"""
ZİRAVE Gemini AI Service
Google Gemini integration for plant disease analysis and agricultural intelligence
"""

import google.generativeai as genai
import os
from typing import Dict, List, Optional, Any
from PIL import Image
import io
import base64
import json
from datetime import datetime

class GeminiService:
    def __init__(self):
        """Initialize Gemini service with API key"""
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize models
        self.text_model = genai.GenerativeModel('gemini-1.5-flash')
        self.vision_model = genai.GenerativeModel('gemini-1.5-flash')
        
        # System prompts for agricultural context
        self.agricultural_prompt = """
        أنت خبير زراعي متخصص في تشخيص أمراض النباتات. مهمتك:
        1. تحليل أعراض النباتات بدقة
        2. تحديد نوع المرض أو المشكلة
        3. تقديم توصيات علاجية عملية
        4. إعطاء نصائح وقائية
        
        استجب باللغة العربية وكن دقيقاً ومفيداً للمزارعين.
        """
        
        self.vision_prompt = """
        تحليل صورة نبات لـ:
        1. تحديد نوع النبات
        2. تشخيص أي أمراض أو مشاكل مرئية
        3. تقييم شدة المشكلة
        4. تقديم توصيات فورية
        
        استجب باللغة العربية مع تفاصيل دقيقة.
        """
    
    async def analyze_symptoms(self, plant_type: str, symptoms: List[str], location: str = "", season: str = "") -> Dict[str, Any]:
        """
        تحليل أعراض النبات باستخدام Gemini
        """
        try:
            prompt = f"""
            {self.agricultural_prompt}
            
            معلومات النبات:
            - النوع: {plant_type}
            - الأعراض: {', '.join(symptoms)}
            - الموقع: {location if location else 'غير محدد'}
            - الموسم: {season if season else 'غير محدد'}
            
            قم بتحليل هذه الأعراض وقدم:
            1. التشخيص المحتمل
            2. مستوى الثقة (0-100%)
            3. الأسباب المحتملة
            4. خطة العلاج
            5. إجراءات الوقاية
            6. متى يجب استشارة خبير
            
            استجب بتنسيق JSON:
            {{
                "diagnosis": "التشخيص",
                "confidence": 85,
                "causes": ["السبب 1", "السبب 2"],
                "treatment_plan": "خطة العلاج",
                "prevention": "إجراءات الوقاية",
                "expert_consultation": "متى تستشير خبير",
                "severity": "high/medium/low",
                "immediate_actions": ["إجراء فوري 1", "إجراء فوري 2"]
            }}
            """
            
            response = self.text_model.generate_content(prompt)
            
            # Parse JSON response
            try:
                result = json.loads(response.text)
                result['timestamp'] = datetime.now().isoformat()
                result['model'] = 'gemini-1.5-flash'
                return result
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    'diagnosis': 'تحليل الأعراض',
                    'confidence': 75,
                    'causes': ['تحليل الأعراض جارٍ'],
                    'treatment_plan': response.text,
                    'prevention': 'استمر في المراقبة',
                    'expert_consultation': 'إذا استمرت الأعراض',
                    'severity': 'medium',
                    'immediate_actions': ['مراقبة النبات'],
                    'timestamp': datetime.now().isoformat(),
                    'model': 'gemini-1.5-flash',
                    'raw_response': response.text
                }
                
        except Exception as e:
            return {
                'error': f'Gemini analysis failed: {str(e)}',
                'diagnosis': 'تحليل غير متاح',
                'confidence': 0,
                'timestamp': datetime.now().isoformat()
            }
    
    async def analyze_image(self, image_bytes: bytes, plant_type: Optional[str] = None) -> Dict[str, Any]:
        """
        تحليل صورة النبات باستخدام Gemini Vision
        """
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Prepare prompt
            prompt = f"""
            {self.vision_prompt}
            
            {f'نوع النبات المتوقع: {plant_type}' if plant_type else 'حدد نوع النبات'}
            
            قم بتحليل هذه الصورة بدقة وقدم:
            1. نوع النبات (إذا لم يتم تحديده)
            2. حالة النبات الصحية
            3. أي أمراض أو مشاكل مرئية
            4. شدة المشكلة
            5. توصيات فورية
            6. خطة علاج مفصلة
            
            استجب بتنسيق JSON:
            {{
                "plant_type": "نوع النبات",
                "health_status": "excellent/good/fair/poor",
                "diseases": ["المرض 1", "المرض 2"],
                "severity": "high/medium/low",
                "confidence": 90,
                "immediate_recommendations": ["توصية 1", "توصية 2"],
                "treatment_plan": "خطة العلاج",
                "prevention_tips": "نصائح الوقاية",
                "visual_analysis": "تحليل بصري مفصل"
            }}
            """
            
            response = self.vision_model.generate_content([prompt, image])
            
            # Parse JSON response
            try:
                result = json.loads(response.text)
                result['timestamp'] = datetime.now().isoformat()
                result['model'] = 'gemini-1.5-flash-vision'
                result['image_analyzed'] = True
                return result
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    'plant_type': plant_type or 'غير محدد',
                    'health_status': 'تحليل جارٍ',
                    'diseases': ['تحليل الصورة جارٍ'],
                    'severity': 'medium',
                    'confidence': 70,
                    'immediate_recommendations': ['مراقبة النبات'],
                    'treatment_plan': response.text,
                    'prevention_tips': 'استمر في المراقبة',
                    'visual_analysis': 'تحليل بصري',
                    'timestamp': datetime.now().isoformat(),
                    'model': 'gemini-1.5-flash-vision',
                    'image_analyzed': True,
                    'raw_response': response.text
                }
                
        except Exception as e:
            return {
                'error': f'Gemini vision analysis failed: {str(e)}',
                'plant_type': plant_type or 'غير محدد',
                'health_status': 'تحليل غير متاح',
                'confidence': 0,
                'timestamp': datetime.now().isoformat()
            }
    
    async def get_agricultural_advice(self, question: str, context: str = "") -> Dict[str, Any]:
        """
        الحصول على نصائح زراعية عامة
        """
        try:
            prompt = f"""
            {self.agricultural_prompt}
            
            السؤال: {question}
            {f'السياق: {context}' if context else ''}
            
            قدم إجابة شاملة ومفيدة باللغة العربية.
            """
            
            response = self.text_model.generate_content(prompt)
            
            return {
                'question': question,
                'answer': response.text,
                'timestamp': datetime.now().isoformat(),
                'model': 'gemini-1.5-flash'
            }
            
        except Exception as e:
            return {
                'error': f'Gemini advice failed: {str(e)}',
                'question': question,
                'answer': 'عذراً، لا يمكن تقديم النصيحة حالياً',
                'timestamp': datetime.now().isoformat()
            }
    
    def is_available(self) -> bool:
        """Check if Gemini service is available"""
        return self.api_key is not None and len(self.api_key) > 0
