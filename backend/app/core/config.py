from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    COOKIE_SECURE: bool = False

    @field_validator("DATABASE_URL")
    @classmethod
    def usar_psycopg2(cls, url: str) -> str:
        for prefijo in ("postgresql://", "postgres://"):
            if url.startswith(prefijo):
                return "postgresql+psycopg2://" + url.removeprefix(prefijo)
        return url

    @property
    def es_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")


settings = Settings()
