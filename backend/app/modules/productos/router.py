from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])
SOLO_ADMIN = [Depends(require_role(["admin"]))]


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
ProductoId = Annotated[int, Path(gt=0)]


def _no_encontrado(e: Exception) -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.get("", response_model=ProductosPaginados, summary="Listar productos activos (paginado)")
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(max_length=100, description="Busca en el nombre, sin distinguir mayúsculas")] = None,
    categoria_id: Annotated[int | None, Query(gt=0)] = None,
    disponible: bool | None = None,
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead, summary="Detalle de un producto")
def obtener_producto(producto_id: ProductoId, service: ServiceDep):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e) from e


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=SOLO_ADMIN,
    summary="Crear un producto (admin)",
)
def crear_producto(datos: ProductoCreate, service: ServiceDep):
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as e:
        raise _no_encontrado(e) from e


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=SOLO_ADMIN, summary="Actualizar un producto (admin)")
def actualizar_producto(producto_id: ProductoId, datos: ProductoUpdate, service: ServiceDep):
    try:
        return service.actualizar(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise _no_encontrado(e) from e


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=SOLO_ADMIN,
    summary="Actualizar stock y disponibilidad (admin)",
)
def actualizar_stock(producto_id: ProductoId, datos: ProductoStockUpdate, service: ServiceDep):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e) from e


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=SOLO_ADMIN,
    summary="Baja lógica de un producto (admin)",
)
def eliminar_producto(producto_id: ProductoId, service: ServiceDep):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
