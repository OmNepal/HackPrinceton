"""
Database connection setup
"""
# import ssl
# from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/foundrmate")

# Global database connection
client = None
db = None

async def connect_db():
    """Connect to MongoDB"""
    global client, db
    # MongoDB connection disabled
    # try:
    #     # Check if URI is for MongoDB Atlas (cloud) or local
    #     is_atlas = "mongodb+srv://" in MONGODB_URI or "mongodb.net" in MONGODB_URI
    #     
    #     if is_atlas:
    #         # Use TLS for MongoDB Atlas
    #         client = AsyncIOMotorClient(
    #             MONGODB_URI,
    #             tls=True,
    #             tlsAllowInvalidCertificates=False,
    #             tlsCAFile=None,
    #             tlsVersion=ssl.PROTOCOL_TLSv1_2
    #         )
    #     else:
    #         # No TLS for local MongoDB
    #         client = AsyncIOMotorClient(MONGODB_URI)
    #     
    #     # Extract database name from URI or use default
    #     if "/" in MONGODB_URI.rsplit("?", 1)[0]:
    #         db_name = MONGODB_URI.rsplit("/", 1)[-1].split("?")[0]
    #         if not db_name or db_name == MONGODB_URI:
    #             db_name = "foundrmate"
    #     else:
    #         db_name = "foundrmate"
    #     db = client[db_name]
    #     # Test connection
    #     await client.admin.command('ping')
    #     print("✅ MongoDB connected successfully")
    #     return db
    # except Exception as e:
    #     print(f"❌ MongoDB connection error: {e}")
    #     raise
    db = None
    client = None
    return None

async def close_db():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()

def get_db():
    """Get database instance"""
    return db

