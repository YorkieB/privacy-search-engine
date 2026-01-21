#!/bin/bash
# Complete deployment package creation script

echo "📦 Creating deployment package for Privacy Search Engine..."

# Create deployment directory structure
mkdir -p privacy-search-deploy/{frontend,backend}

# Copy all necessary files
echo "📁 Copying project files..."

# Root files
cp Dockerfile privacy-search-deploy/
cp docker-compose.yml privacy-search-deploy/
cp nginx.conf privacy-search-deploy/
cp deploy.sh privacy-search-deploy/
cp DEPLOYMENT.md privacy-search-deploy/
cp README-DEPLOYMENT.md privacy-search-deploy/
cp .env privacy-search-deploy/

# Frontend files
cp -r frontend/ privacy-search-deploy/frontend/

# Backend files  
cp -r backend/ privacy-search-deploy/backend/

# Create archive
echo "🗜️ Creating deployment archive..."
tar -czf privacy-search-engine-$(date +%Y%m%d-%H%M%S).tar.gz privacy-search-deploy/

echo "✅ Deployment package ready!"
echo "📤 Upload the .tar.gz file to your server"
echo "🚀 Then run: tar -xzf privacy-search-engine-*.tar.gz && cd privacy-search-deploy && ./deploy.sh"

# Clean up
rm -rf privacy-search-deploy/