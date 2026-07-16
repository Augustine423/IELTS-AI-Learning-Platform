import os
from pathlib import Path
from functools import lru_cache
from typing import Any

import yaml
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_base_url: str = "https://api.groq.com/openai/v1"
    groq_api_key: str = ""
    deepgram_api_key: str = ""
    assemblyai_api_key: str = ""
    elevenlabs_api_key: str = ""
    frontend_url: str = "http://localhost:80"
    livekit_url: str = ""
    livekit_api_key: str = ""
    livekit_api_secret: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


def load_yaml_config() -> dict[str, Any]:
    config_path = Path(__file__).parent.parent / "config.yaml"
    if config_path.exists():
        with open(config_path, encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {}


def get_config() -> dict[str, Any]:
    return load_yaml_config()
