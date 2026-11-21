from collections.abc import Sequence

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def get_activo(self, producto_id: int) -> Producto | None:
        producto = self.get_by_id(producto_id)
        return producto if producto is not None and producto.activo else None

    def get_activo_para_actualizar(self, producto_id: int) -> Producto | None:
        consulta = select(Producto).where(Producto.id == producto_id, col(Producto.activo).is_(True)).with_for_update()
        return self.session.exec(consulta).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, Sequence[Producto]]:
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        consulta = select(Producto).where(*filtros).order_by(col(Producto.nombre)).offset(skip).limit(limit)
        return total, self.session.exec(consulta).all()
