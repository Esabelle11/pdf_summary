# Document AI

A FastAPI-based application for intelligent document analysis using NLP. Extract summaries and keywords from PDF documents automatically.

## Features

- 📄 **PDF Processing**: Extract text from PDF documents
- 🤖 **AI-Powered Summarization**: Generate concise summaries using transformer models
- 🔍 **Keyword Extraction**: Automatically identify key terms and concepts
- 🚀 **FastAPI Backend**: High-performance async API
- 🎨 **Modern Frontend**: Interactive web interface
- 🐳 **Docker Support**: Easy containerization and deployment

## Tech Stack

- **Backend**: FastAPI, uvicorn
- **NLP/ML**: transformers, torch, scikit-learn, keybert
- **PDF Processing**: pdfplumber, pdfminer
- **Frontend**: HTML, CSS, JavaScript
- **Language Detection**: langdetect

## Prerequisites

- Python 3.11+
- Docker & Docker Compose (optional)
- 4GB+ RAM (for transformer models)

## Installation

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://gitlab.com/your-username/doc_ai.git
   cd doc_ai
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   uvicorn backend.app:app --reload
   ```

   The API will be available at `http://localhost:8000`

## Docker Setup

### Using Docker Compose (Recommended)

1. **Build and run**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

3. **Stop the application**
   ```bash
   docker-compose down
   ```

### Using Docker Only

1. **Build the image**
   ```bash
   docker build -t doc-ai .
   ```

2. **Run the container**
   ```bash
   docker run -p 8000:8000 -v $(pwd)/uploads:/app/uploads doc-ai
   ```

