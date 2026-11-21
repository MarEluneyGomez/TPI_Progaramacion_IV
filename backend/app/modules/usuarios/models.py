from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido

ROL_USER = "user"
ROL_ADMIN = "admin"


def ahora() -> datetime:
    return datetime.now(UTC)


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=120)
    email: str = Field(max_length=254, unique=True, index=True)
    hashed_password: str = Field(max_length=255)
    role: str = Field(default=ROL_USER, max_length=10)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True), nullable=False)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
