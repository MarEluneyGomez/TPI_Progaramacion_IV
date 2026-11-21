from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"No existe una categoría con id {categoria_id}")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._obtener_activa(uow, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._validar_nombre_unico(uow, datos.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(datos))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            cambios = datos.model_dump(exclude_unset=True)
            if cambios.get("nombre") is None:
                cambios.pop("nombre", None)
            else:
                self._validar_nombre_unico(uow, cambios["nombre"], id_actual=categoria_id)
            categoria.sqlmodel_update(cambios)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _obtener_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_activa(categoria_id)
        if categoria is None:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria

    # La baja lógica no libera el nombre: también se compara contra las categorías inactivas
    @staticmethod
    def _validar_nombre_unico(uow: CategoriaUnitOfWork, nombre: str, id_actual: int | None = None) -> None:
        existente = uow.categorias.get_by_nombre(nombre)
        if existente is not None and existente.id != id_actual:
            raise NombreDuplicado(nombre)
