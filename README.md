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

## API Endpoints

### Analyze Document
- **POST** `/analyze`
- **Description**: Upload a PDF and get summary + keywords
- **Parameters**: 
  - `file` (multipart/form-data): PDF file to analyze
- **Response**:
  ```json
  {
    "summary": "Extracted summary text...",
    "keywords": ["keyword1", "keyword2", ...],
    "text_length": 5000
  }
  ```

### Root
- **GET** `/`
- **Description**: Serves the frontend HTML

### API Documentation
- **GET** `/docs` - Interactive Swagger UI
- **GET** `/redoc` - ReDoc documentation

## Project Structure

```
doc_ai/
├── backend/
│   ├── __init__.py
│   ├── app.py              # FastAPI application
│   ├── nlp.py              # NLP processing functions
│   ├── pdf_utils.py        # PDF extraction utilities
│   └── __pycache__/
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── script.js           # JavaScript logic
│   └── style.css           # Styling
├── uploads/                # Temporary file storage
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── .gitignore              # Git ignore rules
├── .dockerignore            # Docker ignore rules
└── README.md               # This file
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=uploads

# NLP Models (optional)
# MODEL_NAME=bert-base-multilingual-cased
```

## Usage Examples

### Using cURL

```bash
# Analyze a PDF
curl -X POST "http://localhost:8000/analyze" \
  -F "file=@document.pdf"
```

### Using Python

```python
import requests

with open('document.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/analyze', files=files)
    print(response.json())
```

### Using the Web Interface

1. Open `http://localhost:8000` in your browser
2. Upload a PDF file
3. View the extracted summary and keywords

## Development

### Running Tests

```bash
pytest
```

### Code Style

```bash
# Format with Black
black backend/ frontend/

# Lint with Flake8
flake8 backend/
```

### Logs

```bash
# Docker logs
docker-compose logs -f doc-ai

# Local logs (if configured)
tail -f logs/app.log
```

## Troubleshooting

### Out of Memory
If you encounter memory issues, especially with large PDFs:
- Increase Docker's memory allocation
- Process smaller batches of documents
- Consider using a smaller model (distilbert instead of bert)

### Model Download Issues
The first run will download transformer models (~500MB-1GB). Ensure you have:
- Sufficient disk space
- Working internet connection
- The models will be cached afterward

### Port Already in Use
If port 8000 is already in use:
```bash
# Change the port in docker-compose.yml or
docker run -p 8888:8000 doc-ai
```

## Deployment

### GitLab CI/CD

Push to GitLab and CI/CD pipeline will:
1. Build Docker image
2. Run tests
3. Push to registry
4. Deploy to production

See `.gitlab-ci.yml` for configuration.

### Production Considerations

1. **Use environment-specific configs**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
   ```

2. **Set up reverse proxy** (Nginx/Traefik)

3. **Enable HTTPS** with Let's Encrypt

4. **Configure persistent storage** for uploads

5. **Set proper resource limits** for containers

## Performance Tips

- Use GPU acceleration if available
- Enable caching for repeated requests
- Consider using async database if needed
- Monitor memory usage and adjust model sizes

## Contributing

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes and commit
   ```bash
   git commit -am 'Add new feature'
   ```

3. Push to GitLab
   ```bash
   git push origin feature/your-feature
   ```

4. Create a Merge Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue on GitLab
- Check the [documentation](docs/)
- Review API docs at `/docs` endpoint

## Changelog

### Version 1.0.0 (2026-02-09)
- Initial release
- PDF analysis with summarization and keyword extraction
- Docker support
- Full API documentation
