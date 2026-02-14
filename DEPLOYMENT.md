# Deployment Guide

## Prerequisites

- GitLab account with a repository set up
- Docker and Docker Compose installed
- SSH access to deployment server (if deploying to production)

## GitLab Setup

### 1. Create Repository on GitLab

```bash
# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://gitlab.com/your-username/doc_ai.git

# Create .gitkeep in uploads directory
touch uploads/.gitkeep

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Document AI application"

# Push to GitLab
git push -u origin main
```

### 2. Configure GitLab Variables (for CI/CD)

1. Go to your GitLab project
2. Settings → CI/CD → Variables
3. Add these variables:

```
CI_REGISTRY_USER: your_gitlab_username
CI_REGISTRY_PASSWORD: your_gitlab_personal_access_token
DEPLOY_KEY: your_ssh_private_key_content
DEPLOY_HOST: your.production.server.com
DEPLOY_USER: deploy_user
DEPLOY_PATH: /var/www/doc_ai
```

### 3. Create Deploy Key

```bash
# On your server
ssh-keygen -t ed25519 -f ~/.ssh/doc_ai_deploy -N ""

# Copy public key to GitLab
cat ~/.ssh/doc_ai_deploy.pub
# Settings → Deploy Keys → Add key
```

## Local Development

### First Time Setup

```bash
# Clone repository
git clone https://gitlab.com/your-username/doc_ai.git
cd doc_ai

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn backend.app:app --reload
```

### Docker Setup (Local)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Production Deployment

### Option 1: Using Docker Compose on Server

```bash
# 1. SSH into server
ssh user@your-production-server.com

# 2. Clone repository
git clone https://gitlab.com/your-username/doc_ai.git
cd doc_ai

# 3. Create production override file
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'
services:
  doc-ai:
    image: registry.gitlab.com/your-username/doc_ai:latest
    restart: always
    environment:
      - DEBUG=False
    ports:
      - "127.0.0.1:8000:8000"
EOF

# 4. Pull latest image
docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD registry.gitlab.com
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull

# 5. Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 6. Check status
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

### Option 2: Using Kubernetes

Create a `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: doc-ai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: doc-ai
  template:
    metadata:
      labels:
        app: doc-ai
    spec:
      containers:
      - name: doc-ai
        image: registry.gitlab.com/your-username/doc_ai:latest
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        env:
        - name: DEBUG
          value: "False"
---
apiVersion: v1
kind: Service
metadata:
  name: doc-ai-service
spec:
  selector:
    app: doc-ai
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: LoadBalancer
```

Deploy with:
```bash
kubectl apply -f k8s-deployment.yaml
```

## SSL/HTTPS Setup with Nginx

### 1. Install Nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 2. Create Nginx Config

```bash
sudo cat > /etc/nginx/sites-available/doc_ai << 'EOF'
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support (if needed)
    location /ws {
        proxy_pass http://127.0.0.1:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/doc_ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Install Let's Encrypt Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

## Monitoring and Logs

### View Docker Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs doc-ai

# Follow logs
docker-compose logs -f
```

### Health Check

```bash
curl http://localhost:8000/healthz

# Or
curl http://your-domain.com/
```

## Backup Strategy

### Database Backup

```bash
# Create backup cron job
0 2 * * * cd /var/www/doc_ai && docker-compose exec db pg_dump -U user dbname > backup_$(date +\%Y\%m\%d).sql
```

### File Backups

```bash
# Backup uploads directory
0 3 * * * tar -czf /backups/doc_ai_uploads_$(date +\%Y\%m\%d).tar.gz /var/www/doc_ai/uploads/
```

## Updating the Application

### Automated (CI/CD)

1. Push changes to main branch
2. GitLab CI/CD pipeline runs tests and builds Docker image
3. Manual approval for production deployment
4. Container is pulled and restarted on server

### Manual Update

```bash
# Pull latest code
git pull origin main

# Pull latest Docker image
docker-compose pull

# Restart services
docker-compose up -d

# Verify
docker-compose ps
```

## Troubleshooting

### Memory Issues

Increase Docker memory:
```bash
# Edit docker-compose.yml
services:
  doc-ai:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

### Port Already in Use

```bash
# Find what's using port 8000
lsof -i :8000

# Kill process or use different port
docker-compose -p doc_ai_2 up -d
```

### DNS Issues

```bash
# Check DNS resolution
nslookup your-domain.com

# Or
dig your-domain.com
```

## Rollback

If something goes wrong:

```bash
# View available image tags
docker images | grep doc_ai

# Revert to previous version
docker tag registry.gitlab.com/username/doc_ai:previous-tag doc-ai:latest
docker-compose up -d
```

## Performance Monitoring

### Using Prometheus + Grafana

Add to docker-compose:
```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
```

## Security Checklist

- [ ] Set DEBUG=False in production
- [ ] Use HTTPS with valid certificate
- [ ] Set strong CORS origins
- [ ] Rotate API keys regularly
- [ ] Use environment variables for secrets
- [ ] Enable firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Set up automated backups
- [ ] Rate limiting enabled

## Useful Commands

```bash
# Check application status
docker-compose ps

# View resource usage
docker stats

# Execute command in container
docker-compose exec doc-ai python -c "import torch; print(torch.cuda.is_available())"

# Clear old images and containers
docker system prune -a

# Restart service
docker-compose restart doc-ai

# Rebuild image
docker-compose build --no-cache
```
