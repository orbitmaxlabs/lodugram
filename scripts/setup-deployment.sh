#!/bin/bash

# LODUCHAT Deployment Setup Script
echo "🚀 LODUCHAT Deployment Setup"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run:"
    echo "   git init"
    echo "   git remote add origin https://github.com/yourusername/loduchat.git"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Please create it with your Firebase configuration:"
    echo ""
    echo "VITE_FIREBASE_API_KEY=your_api_key"
    echo "VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com"
    echo "VITE_FIREBASE_PROJECT_ID=your_project_id"
    echo "VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com"
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id"
    echo "VITE_FIREBASE_APP_ID=your_app_id"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if CNAME is configured
if grep -q "yourdomain.com" "public/CNAME"; then
    echo "⚠️  Please update public/CNAME with your actual domain name"
    echo "   Current: yourdomain.com"
    echo "   Change to: your-actual-domain.com"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Check if remote is configured
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "❌ Git remote not configured. Please run:"
    echo "   git remote add origin https://github.com/yourusername/loduchat.git"
    exit 1
fi

echo "✅ Setup complete! Next steps:"
echo ""
echo "1. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Initial deployment setup'"
echo "   git push -u origin main"
echo ""
echo "2. Configure GitHub Secrets:"
echo "   - Go to your repository Settings → Secrets and variables → Actions"
echo "   - Add all Firebase environment variables from .env.local"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to Settings → Pages"
echo "   - Set source to 'GitHub Actions'"
echo ""
echo "4. Configure your custom domain DNS settings"
echo ""
echo "5. Monitor deployment in the Actions tab"
echo ""
echo "🎉 Your app will be live at: https://$(cat public/CNAME)" 