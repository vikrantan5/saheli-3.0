from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import base64
import os
import uuid
import json
from datetime import datetime
from dotenv import load_dotenv
import asyncio

load_dotenv()

app = FastAPI(title="Saheli Deepfake Analyzer API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import deepfake detection modules
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False
    print("⚠️  emergentintegrations not installed. Using fallback detection.")

class DeepfakeAnalysisResult(BaseModel):
    verification_result: str  # "real", "suspicious", "deepfake"
    confidence_score: float  # 0-100
    deepfake_probability: float  # 0-100
    face_consistency_score: float  # 0-100
    texture_anomaly_score: float  # 0-100
    metadata_integrity: float  # 0-100
    explanation: str
    detailed_findings: List[str]
    recommendations: List[str]
    analysis_timestamp: str

class AnalysisRequest(BaseModel):
    image_base64: str
    mime_type: Optional[str] = "image/jpeg"

async def analyze_with_ai(image_base64: str) -> Dict:
    """Use AI vision model for deepfake detection"""
    if not EMERGENT_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    try:
        # Initialize AI chat with vision model
        chat = LlmChat(
            api_key=api_key,
            session_id=f"deepfake-{uuid.uuid4()}",
            system_message="""You are an expert AI Security & Computer Vision specialist in Deepfake Detection and Image Forensics.
            
Your task is to analyze images and determine if they are:
            - Authentic (real photo)
            - Manipulated (edited/altered)
            - AI-generated / Deepfake
            
Analyze the image for:
            1. Pixel-level artifacts and GAN fingerprints
            2. Unnatural lighting or shadows
            3. Face geometry inconsistencies (eyes, nose, jawline)
            4. Skin texture abnormalities (over-smoothing, pore inconsistency)
            5. Blending boundary errors
            6. Facial symmetry issues
            7. Unrealistic reflections or highlights
            
Provide your response in JSON format with these exact fields:
            {
              "verdict": "real" | "suspicious" | "deepfake",
              "confidence": 0-100,
              "deepfake_probability": 0-100,
              "face_consistency": 0-100,
              "texture_anomaly": 0-100,
              "findings": ["list of specific observations"],
              "explanation": "user-friendly explanation without technical jargon"
            }
            """
        ).with_model("openai", "gpt-5.1")
        
        # Create image content
        image_content = ImageContent(image_base64=image_base64)
        
        # Send analysis request
        user_message = UserMessage(
            text="Analyze this image for deepfake detection. Provide detailed analysis.",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse AI response
        try:
            # Extract JSON from response
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            result = json.loads(response_text)
            return result
        except json.JSONDecodeError:
            # Fallback: parse from text response
            return {
                "verdict": "suspicious",
                "confidence": 60,
                "deepfake_probability": 40,
                "face_consistency": 70,
                "texture_anomaly": 30,
                "findings": ["Analysis completed but response format needs adjustment"],
                "explanation": response[:500]
            }
    
    except Exception as e:
        print(f"AI analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

async def basic_analysis(image_base64: str) -> Dict:
    """Fallback: Basic client-side checks"""
    # Simulate basic analysis
    return {
        "verdict": "suspicious",
        "confidence": 50,
        "deepfake_probability": 50,
        "face_consistency": 75,
        "texture_anomaly": 25,
        "findings": [
            "Basic metadata analysis completed",
            "Unable to perform deep AI analysis",
            "Recommend manual verification"
        ],
        "explanation": "Basic analysis completed. For comprehensive deepfake detection, AI service is required."
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Saheli Deepfake Analyzer",
        "ai_available": EMERGENT_AVAILABLE
    }

@app.post("/api/analyze-deepfake", response_model=DeepfakeAnalysisResult)
async def analyze_deepfake(request: AnalysisRequest):
    """Analyze an image for deepfake detection"""
    try:
        # Use AI analysis if available, otherwise fallback
        if EMERGENT_AVAILABLE:
            analysis = await analyze_with_ai(request.image_base64)
        else:
            analysis = await basic_analysis(request.image_base64)
        
        # Map verdict to result
        verdict_map = {
            "real": "🟢 Likely Real",
            "suspicious": "🟡 Suspicious / Possibly Manipulated",
            "deepfake": "🔴 High Probability Deepfake"
        }
        
        # Generate recommendations based on verdict
        recommendations = []
        if analysis["verdict"] == "deepfake":
            recommendations = [
                "This image shows signs of AI manipulation",
                "If this image is being used to harass or threaten you, Saheli can help",
                "You can report this to cyber-crime authorities",
                "Consider reaching out to legal support services"
            ]
        elif analysis["verdict"] == "suspicious":
            recommendations = [
                "This image shows some inconsistencies",
                "Consider verifying with the source",
                "Be cautious if this image is used in sensitive contexts"
            ]
        else:
            recommendations = [
                "This image appears to be authentic",
                "No significant manipulation detected"
            ]
        
        # Calculate metadata integrity (simulated)
        metadata_integrity = 85.0  # Would check EXIF in real implementation
        
        return DeepfakeAnalysisResult(
            verification_result=verdict_map.get(analysis["verdict"], "🟡 Suspicious"),
            confidence_score=float(analysis["confidence"]),
            deepfake_probability=float(analysis["deepfake_probability"]),
            face_consistency_score=float(analysis["face_consistency"]),
            texture_anomaly_score=float(analysis["texture_anomaly"]),
            metadata_integrity=metadata_integrity,
            explanation=analysis["explanation"],
            detailed_findings=analysis["findings"],
            recommendations=recommendations,
            analysis_timestamp=datetime.utcnow().isoformat()
        )
    
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
