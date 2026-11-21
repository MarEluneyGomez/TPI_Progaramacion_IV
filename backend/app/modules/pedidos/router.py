from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import AdminUser, CurrentUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
PedidoId = Annotated[int, Path(gt=0)]


def _traducir(e: Exception) -> HTTPException:
    if isinstance(e, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    if isinstance(e, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(e))
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


ERRORES_DE_DOMINIO = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED, summary="Crear un pedido desde el carrito")
def crear_pedido(datos: PedidoCreate, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.crear(datos, usuario.id)
    except ERRORES_DE_DOMINIO as e:
        raise _traducir(e) from e


@router.get("", response_model=PedidosPaginados, summary="Listar pedidos (propios o todos si es admin)")
def listar_pedidos(
    usuario: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(usuario, estado, skip, limit)


@router.get("/resumen", response_model=ResumenPedidos, summary="Indicadores del panel (admin)")
def resumen_pedidos(_: AdminUser, service: ServiceDep):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead, summary="Detalle de un pedido (dueño o admin)")
def obtener_pedido(pedido_id: PedidoId, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.obtener(pedido_id, usuario)
    except ERRORES_DE_DOMINIO as e:
        raise _traducir(e) from e


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, summary="Avanzar o cancelar un pedido (admin)")
def cambiar_estado(pedido_id: PedidoId, datos: CambioEstado, _: AdminUser, service: ServiceDep):
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except ERRORES_DE_DOMINIO as e:
        raise _traducir(e) from e


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead, summary="Cancelar un pedido propio en PENDIENTE")
def cancelar_pedido(pedido_id: PedidoId, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.cancelar(pedido_id, usuario)
    except ERRORES_DE_DOMINIO as e:
        raise _traducir(e) from e
