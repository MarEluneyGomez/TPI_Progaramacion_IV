from datetime import UTC, datetime, timedelta

from fastapi import Response
from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

COOKIE_NAME = "access_token"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

HASH_FICTICIO = pwd_context.hash("contraseña-de-relleno")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(usuario_id: int) -> str:
    expira = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(usuario_id), "exp": expira}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> int:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    return int(payload["sub"])


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


def delete_auth_cookie(response: Response) -> None:
    response.delete_cookie(key=COOKIE_NAME, httponly=True, secure=settings.COOKIE_SECURE, samesite="lax", path="/")
