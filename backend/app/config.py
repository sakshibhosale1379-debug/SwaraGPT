"""
SwaraGPT Backend Configuration
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "SwaraGPT API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # JWT Authentication
    SECRET_KEY: str = "swaragpt-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # PostgreSQL
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "swaragpt"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "swaragpt"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_AUDIO_SIZE_MB: int = 50
    ALLOWED_AUDIO_FORMATS: list[str] = [".wav", ".mp3", ".m4a", ".ogg", ".flac"]
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
