from collections.abc import Sequence

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        return self.session.exec(consulta).first()

    def get_activa(self, categoria_id: int) -> Categoria | None:
        categoria = self.get_by_id(categoria_id)
        return categoria if categoria is not None and categoria.activo else None

    def list_activas(self) -> Sequence[Categoria]:
        consulta = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(col(Categoria.nombre))
        return self.session.exec(consulta).all()
