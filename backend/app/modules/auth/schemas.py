from sqlmodel import SQLModel

from app.modules.usuarios.schemas import UserCreate, UserPublic

__all__ = ["LoginResponse", "LogoutResponse", "UserCreate", "UserPublic"]


class LoginResponse(SQLModel):
    message: str = "Login exitoso"


class LogoutResponse(SQLModel):
    message: str = "Sesión cerrada"
