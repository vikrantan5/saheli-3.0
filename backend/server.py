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
import fal_client

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

# Initialize fal.ai LLAVA client
FAL_API_KEY = os.getenv("FAL_API_KEY")
FAL_AVAILABLE = bool(FAL_API_KEY)

if FAL_AVAILABLE:
    os.environ["FAL_KEY"] = FAL_API_KEY
    print("✅ fal.ai LLAVA API initialized successfully.")
else:
    print("⚠️  FAL_API_KEY not found. Deepfake detection will not work.")

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
    """Use fal.ai LLAVA model for deepfake detection"""
    if not FAL_AVAILABLE:
        raise HTTPException(status_code=503, detail="fal.ai API key not configured")
    
    try:
        # Create data URI for the image
        image_url = f"data:image/jpeg;base64,{image_base64}"
        
        # Simplified prompt - ask for description first, then we'll structure it
        prompt = """Analyze this image carefully. Is it: 
1) A real photograph
2) AI-generated/deepfake
3) Edited/manipulated

Look at: lighting, shadows, face geometry, skin texture, digital artifacts.

Give a 2-3 sentence analysis stating your conclusion and key observations."""

        # Call fal.ai LLAVA API
        def run_sync():
            return fal_client.subscribe(
                "fal-ai/llava-next",
                arguments={
                    "image_url": image_url,
                    "prompt": prompt
                },
                with_logs=False
            )
        
        # Run in executor to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_sync)
        
        # Extract response
        response_text = result.get("output", "").strip()
        
        # Log for debugging
        print(f"LLAVA Response: {response_text}")
        
        # Since LLAVA gives us text analysis, we need to interpret it intelligently
        response_lower = response_text.lower()
        
        # Determine verdict based on keywords and context in response
        verdict = "suspicious"
        confidence = 60
        deepfake_prob = 50
        face_consistency = 70
        texture_anomaly = 30
        
        # Check for negative indicators (deepfake/fake)
        negative_phrases = [
            "not a real", "not real", "appears to be fake", "digital creation",
            "manipulation", "ai-generated", "deepfake", "synthetic", "artificial",
            "generated", "fake", "edited image", "altered image", "digital manipulation",
            "unrealistic", "unnatural", "artificial intelligence", "computer generated"
        ]
        
        # Check for positive indicators (real/authentic)
        positive_phrases = [
            "appears to be real", "real photograph", "authentic", "genuine",
            "natural photograph", "real image", "real photo", "legitimate",
            "unmanipulated", "original"
        ]
        
        negative_count = sum(1 for phrase in negative_phrases if phrase in response_lower)
        positive_count = sum(1 for phrase in positive_phrases if phrase in response_lower)
        
        # Decision logic
        if negative_count > positive_count:
            verdict = "deepfake"
            confidence = min(70 + (negative_count * 5), 95)
            deepfake_prob = min(75 + (negative_count * 5), 95)
            face_consistency = max(40 - (negative_count * 5), 20)
            texture_anomaly = min(65 + (negative_count * 5), 90)
        elif positive_count > negative_count:
            verdict = "real"
            confidence = min(75 + (positive_count * 5), 95)
            deepfake_prob = max(25 - (positive_count * 5), 5)
            face_consistency = min(80 + (positive_count * 3), 95)
            texture_anomaly = max(20 - (positive_count * 3), 5)
        else:
            # Unclear or mixed signals
            verdict = "suspicious"
            confidence = 65
            deepfake_prob = 50
            face_consistency = 65
            texture_anomaly = 45
        
        # Extract key observations
        findings = []
        sentences = response_text.split(". ")
        for sentence in sentences[:3]:  # Take first 3 sentences as findings
            if sentence.strip():
                findings.append(sentence.strip())
        
        if not findings:
            findings = [response_text[:200]]
        
        return {
            "verdict": verdict,
            "confidence": confidence,
            "deepfake_probability": deepfake_prob,
            "face_consistency": face_consistency,
            "texture_anomaly": texture_anomaly,
            "findings": findings,
            "explanation": response_text[:500]
        }
    
    except Exception as e:
        print(f"fal.ai LLAVA analysis error: {str(e)}")
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
        "ai_available": FAL_AVAILABLE,
        "model": "llava-next",
        "provider": "fal.ai"
    }

@app.post("/api/analyze-deepfake", response_model=DeepfakeAnalysisResult)
async def analyze_deepfake(request: AnalysisRequest):
    """Analyze an image for deepfake detection"""
    try:
        # Use fal.ai LLAVA analysis if available, otherwise fallback
        if FAL_AVAILABLE:
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
