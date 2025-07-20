from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    retell_api_key: str = ""
    debug: bool = False
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "https://127.0.0.1:3000"
    ]
    
    class Config:
        env_file = "../.env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Override with environment variables if they exist
        if os.getenv("RETELL_API_KEY"):
            self.retell_api_key = os.getenv("RETELL_API_KEY")
        if os.getenv("DEBUG"):
            self.debug = os.getenv("DEBUG").lower() == "true"


# Global settings instance
settings = Settings()
