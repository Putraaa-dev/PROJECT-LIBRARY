#!/bin/bash

# Production Build & Deploy Script for Hostinger
# Usage: ./deploy.sh

echo "🚀 Starting production build..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Build frontend
echo "🏗️  Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build complete!"
echo ""
echo "📁 Build output in: dist/"
echo ""
echo "🚀 To start server locally: npm start"
echo "🚀 To deploy: git push hostinger main"
echo ""
