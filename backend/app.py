from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import shutil
import os
import uuid

from .pdf_utils import extract_text_from_pdf
from .nlp import summarize_text, extract_keywords

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    # Save the uploaded file
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from the PDF
    text = extract_text_from_pdf(file_path)

    # Perform NLP tasks
    summary = summarize_text(text)
    keywords = extract_keywords(text)

    # Clean up the uploaded file
    os.remove(file_path)

    return {
        "summary": summary,
        "keywords": keywords,
        "text_length": len(text)
    }

@app.get("/")
async def serve_index():
    frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "index.html")
    return FileResponse(
        frontend_path,
        media_type="text/html",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

# Serve frontend static files (CSS, JS, etc.)
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")