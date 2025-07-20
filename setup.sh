#!/bin/bash

# Retell Voice Call Demo - Setup Script

echo "🎯 Retell Voice Call Demo Setup"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating environment configuration..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your Retell API key!"
    echo "   Get your API key from: https://dashboard.retellai.com/"
    echo ""
    read -p "Press Enter to continue after setting up your API key..."
    echo ""
fi

# Check if Docker is available
if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
    echo "🐳 Docker found! You can run with Docker."
    echo ""
    echo "Choose setup option:"
    echo "1) Run with Docker (recommended)"
    echo "2) Run manually (requires Node.js and Python)"
    read -p "Enter your choice (1-2): " choice
    echo ""
    
    case $choice in
        1)
            echo "🚀 Starting with Docker..."
            docker-compose up --build
            ;;
        2)
            echo "🔧 Manual setup selected..."
            ;;
        *)
            echo "Invalid choice. Exiting..."
            exit 1
            ;;
    esac
else
    echo "⚙️  Docker not found. Setting up manually..."
    choice=2
fi

if [ "$choice" = "2" ]; then
    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        echo "❌ Node.js not found. Please install Node.js 16+ and try again."
        exit 1
    fi

    # Check Python
    if ! command -v python3 >/dev/null 2>&1; then
        echo "❌ Python 3 not found. Please install Python 3.8+ and try again."
        exit 1
    fi

    echo "📦 Installing dependencies..."
    echo ""

    # Setup backend
    echo "Setting up backend..."
    cd backend
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        echo "✅ Created Python virtual environment"
    fi
    
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Backend dependencies installed"
    cd ..

    # Setup frontend
    echo ""
    echo "Setting up frontend..."
    cd frontend
    npm install
    echo "✅ Frontend dependencies installed"
    cd ..

    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "To start the application:"
    echo "1. Backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
    echo "2. Frontend: cd frontend && npm start"
    echo ""
    echo "Or use the run-dev.sh script for automated startup."
fi
