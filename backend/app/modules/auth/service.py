from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.core.deps import CUENTA_DESACTIVADA
from app.core.security import HASH_FICTICIO, hash_password, verify_password
from app.modules.auth.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import ROL_USER, Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        try:
            with self.uow as uow:
                if uow.usuarios.get_by_username(datos.username) is not None:
                    raise HTTPException(status.HTTP_409_CONFLICT, f"El usuario '{datos.username}' ya existe")
                if uow.usuarios.get_by_email(datos.email) is not None:
                    raise HTTPException(status.HTTP_409_CONFLICT, f"El email '{datos.email}' ya está registrado")
                usuario = uow.usuarios.add(
                    Usuario(
                        username=datos.username,
                        full_name=datos.full_name,
                        email=datos.email,
                        hashed_password=hash_password(datos.password),
                        role=ROL_USER,
                    )
                )
                return UserPublic.model_validate(usuario)
        except IntegrityError as e:
            raise HTTPException(status.HTTP_409_CONFLICT, "El usuario o el email ya existen") from e

    def autenticar(self, username: str, password: str) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None:
                verify_password(password, HASH_FICTICIO)
                raise self._credenciales_incorrectas()
            if not verify_password(password, usuario.hashed_password):
                raise self._credenciales_incorrectas()
            if usuario.disabled:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
            return UserPublic.model_validate(usuario)

    @staticmethod
    def _credenciales_incorrectas() -> HTTPException:
        return HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario o contraseña incorrectos")
