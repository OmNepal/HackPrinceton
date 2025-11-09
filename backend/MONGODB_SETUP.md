# MongoDB Setup Guide

## Quick Setup Options

You have **two options** for MongoDB:

### Option 1: Local MongoDB (Easiest for Development)

1. **Install MongoDB Community Edition:**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Or use Chocolatey: `choco install mongodb`
   - Or use MongoDB Atlas (see Option 2)

2. **Start MongoDB:**
   - Windows: MongoDB should start automatically as a service
   - Or run manually: `mongod` (if installed locally)

3. **Create `.env` file in `backend/` directory:**
   ```
   MONGODB_URI=mongodb://localhost:27017/foundrmate
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   DEDALUS_API_KEY=your_dedalus_key_here
   ```

### Option 2: MongoDB Atlas (Cloud - No Installation Needed)

1. **Sign up for free MongoDB Atlas account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create a free cluster (M0 - Free tier)

2. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

3. **Create `.env` file in `backend/` directory:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foundrmate?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   DEDALUS_API_KEY=your_dedalus_key_here
   ```
   - Replace `username` and `password` with your Atlas credentials
   - Make sure to whitelist your IP address in Atlas Network Access settings

## Installation Steps

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Create `.env` file** (see options above)

3. **Run the backend:**
   ```bash
   python main.py
   # or
   uvicorn main:app --reload --port 3000
   ```

4. **Verify connection:**
   - You should see: `✅ MongoDB connected successfully`
   - If you see an error, check your `.env` file and MongoDB setup

## Troubleshooting

- **Connection refused**: Make sure MongoDB is running (local) or your IP is whitelisted (Atlas)
- **Authentication failed**: Check your username/password in the connection string
- **TLS errors**: The code automatically handles TLS for Atlas and disables it for local MongoDB

