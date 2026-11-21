from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int) -> None:
        super().__init__(f"No existe un usuario con id {usuario_id}")


class AutoDesactivacion(Exception):
    def __init__(self) -> None:
        super().__init__("No podés desactivar tu propia cuenta")


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_todos()]

    def obtener(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            return UserPublic.model_validate(self._obtener(uow, usuario_id))

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, id_admin_actual: int) -> UserPublic:
        if usuario_id == id_admin_actual:
            raise AutoDesactivacion()
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    @staticmethod
    def _obtener(uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado(usuario_id)
        return usuario
