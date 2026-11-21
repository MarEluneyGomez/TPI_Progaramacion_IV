from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie
from jose import ExpiredSignatureError, JWTError

from app.core.security import COOKIE_NAME, decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioNoEncontrado, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"

cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False, description="JWT en la cookie HttpOnly access_token")


def _no_autenticado(detalle: str) -> HTTPException:
    return HTTPException(status.HTTP_401_UNAUTHORIZED, detalle)


def get_current_user(token: Annotated[str | None, Depends(cookie_scheme)]) -> UserPublic:
    if not token:
        raise _no_autenticado("No autenticado")
    try:
        usuario_id = decode_access_token(token)
    except ExpiredSignatureError as e:
        raise _no_autenticado("La sesión expiró") from e
    except (JWTError, KeyError, ValueError) as e:
        raise _no_autenticado("Token inválido") from e
    try:
        return UsuarioService(UsuarioUnitOfWork()).obtener(usuario_id)
    except UsuarioNoEncontrado as e:
        raise _no_autenticado("Token inválido") from e


def get_current_active_user(usuario: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
    return usuario


CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    def verificar_rol(usuario: CurrentUser) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tenés permisos para realizar esta acción")
        return usuario

    return verificar_rol


AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
