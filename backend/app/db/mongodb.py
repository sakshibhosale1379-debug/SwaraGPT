"""
MongoDB connection manager for SwaraGPT.
Stores analysis results, chat history, and AI feedback.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_mongodb():
    """Connect to MongoDB on application startup."""
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB]
    print(f"✅ Connected to MongoDB: {settings.MONGODB_DB}")


async def close_mongodb():
    """Close MongoDB connection on application shutdown."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed.")


def get_database():
    """Get the MongoDB database instance."""
    return db
