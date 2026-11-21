from typing import Annotated

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)]
Descripcion = Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)]
ImagenUrl = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500, pattern=r"^https?://\S+$")]


class ProductoCreate(SQLModel):
    nombre: NombreProducto = Field(schema_extra={"examples": ["Pizza muzzarella"]})
    descripcion: Descripcion | None = None
    precio_base: float = Field(ge=0, schema_extra={"examples": [8500]})
    imagen_url: ImagenUrl | None = Field(default=None, schema_extra={"examples": ["https://placehold.co/400x300"]})
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int = Field(gt=0)


class ProductoUpdate(SQLModel):
    nombre: NombreProducto | None = None
    descripcion: Descripcion | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: ImagenUrl | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = Field(default=None, gt=0)


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
