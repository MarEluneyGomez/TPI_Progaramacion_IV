from datetime import datetime
from typing import Annotated, Literal

from pydantic import EmailStr, StringConstraints, field_validator
from sqlmodel import Field, SQLModel

Username = Annotated[
    str, StringConstraints(strip_whitespace=True, to_lower=True, min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_.-]+$")
]
NombreCompleto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Rol = Literal["user", "admin"]


class UserCreate(SQLModel):
    username: Username = Field(schema_extra={"examples": ["juanperez"]})
    full_name: NombreCompleto = Field(schema_extra={"examples": ["Juan Pérez"]})
    email: EmailStr = Field(max_length=254, schema_extra={"examples": ["juan@mail.com"]})
    password: str = Field(min_length=8, schema_extra={"examples": ["secreta123"]})

    @field_validator("email")
    @classmethod
    def email_en_minusculas(cls, email: str) -> str:
        return email.lower()

    # bcrypt solo usa los primeros 72 bytes: una contraseña más larga se rechaza en lugar de truncarse
    @field_validator("password")
    @classmethod
    def password_hasta_72_bytes(cls, password: str) -> str:
        if len(password.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return password


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: Rol
    disabled: bool
    created_at: datetime
