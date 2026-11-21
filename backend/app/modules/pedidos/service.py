from datetime import UTC, datetime

from app.modules.pedidos.models import (
    CANCELADO,
    EN_PREPARACION,
    ENTREGADO,
    PENDIENTE,
    DetallePedido,
    Pedido,
)
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import ROL_ADMIN
from app.modules.usuarios.schemas import UserPublic

TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"No existe un pedido con id {pedido_id}")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ReglaDeNegocio(Exception):
    pass


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, stock: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}': hay {stock} y se pidieron {pedido}")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, desde: str, hacia: str) -> None:
        super().__init__(f"No se puede pasar un pedido de {desde} a {hacia}")


class PedidoNoCancelable(ReglaDeNegocio):
    def __init__(self, estado: str) -> None:
        super().__init__(f"Solo se puede cancelar un pedido PENDIENTE; este está {estado}")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # RN-01: todo el pedido (líneas y descuento de stock) se crea en una sola transacción
    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            vistos: set[int] = set()
            for item in datos.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=PENDIENTE,
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega,
                    notas=datos.notas or None,
                    total=0,
                )
            )

            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_activo_para_actualizar(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario: UserPublic, estado: str | None, skip: int, limit: int) -> PedidosPaginados:
        with self.uow as uow:
            dueno = None if usuario.role == ROL_ADMIN else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(dueno, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if usuario.role != ROL_ADMIN and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    # RN-04: el dueño solo cancela sus propios pedidos y solo mientras están PENDIENTE
    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != PENDIENTE:
                raise PedidoNoCancelable(pedido.estado)
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_de_hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0).astimezone(UTC)
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_de_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado(ENTREGADO), 2),
            )

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    # RN-02 y RN-03: solo transiciones del mapa; cancelar restituye el stock en la misma transacción
    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        if nuevo_estado not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(pedido.estado, nuevo_estado)
        if nuevo_estado == CANCELADO:
            for item in pedido.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is not None:
                    producto.stock += item.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo_estado
        uow.pedidos.add(pedido)
