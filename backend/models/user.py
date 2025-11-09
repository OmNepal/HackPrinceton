"""
User model for authentication
"""
from datetime import datetime
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
import bcrypt
from bson import ObjectId


class User:
    def __init__(self, db):
        self.collection = db.users
        # Create indexes
        self.collection.create_index("email", unique=True)
    
    async def create_user(self, full_name: str, email: str, password: str) -> dict:
        """Create a new user with hashed password"""
        # Check if user exists
        existing_user = await self.collection.find_one({"email": email.lower().strip()})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        user_data = {
            "fullName": full_name.strip(),
            "email": email.lower().strip(),
            "password": hashed_password.decode('utf-8'),
            "ideas": [],
            "createdAt": datetime.utcnow(),
            "lastLogin": None
        }
        
        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return self._to_dict(user_data)
    
    async def find_by_email(self, email: str, include_password: bool = False) -> Optional[dict]:
        """Find user by email"""
        user = await self.collection.find_one({"email": email.lower().strip()})
        if not user:
            return None
        return self._to_dict(user, include_password)
    
    async def find_by_id(self, user_id: str) -> Optional[dict]:
        """Find user by ID"""
        try:
            user = await self.collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return None
            return self._to_dict(user)
        except Exception:
            return None
    
    async def update_last_login(self, user_id: str):
        """Update user's last login time"""
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"lastLogin": datetime.utcnow()}}
        )
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def _to_dict(self, user: dict, include_password: bool = False) -> dict:
        """Convert MongoDB document to dict, excluding sensitive fields"""
        user_dict = {
            "id": str(user["_id"]),
            "fullName": user.get("fullName", ""),
            "email": user.get("email", ""),
            "createdAt": user.get("createdAt").isoformat() if user.get("createdAt") else None,
            "lastLogin": user.get("lastLogin").isoformat() if user.get("lastLogin") else None
        }
        if include_password:
            user_dict["password"] = user.get("password", "")
        return user_dict

