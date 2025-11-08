cd ~/HackPrinceton/backend

cat > setup-backend.sh << 'EOF'
#!/bin/bash

# Create directories
mkdir -p models routes middleware

# Create package.json
cat > package.json << 'PKG'
{
  "name": "foundrmate-backend",
  "version": "1.0.0",
  "description": "Backend API for FoundrMate",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
PKG

echo "✅ Created package.json"

# Create .env.example
cat > .env.example << 'ENV'
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/foundrmate
JWT_SECRET=change_this_to_a_long_random_string
ENV

echo "✅ Created .env.example"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Run: cp .env.example .env"
echo "3. Edit .env and add JWT secret"
echo "4. I'll give you the remaining files (server.js, models, routes, middleware)"
EOF

chmod +x setup-backend.sh
./setup-backend.sh
