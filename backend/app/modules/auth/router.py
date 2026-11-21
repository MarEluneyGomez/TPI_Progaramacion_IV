from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.deps import CurrentUser
from app.core.security import create_access_token, delete_auth_cookie, set_auth_cookie
from app.modules.auth.schemas import (
    LoginResponse,
    LogoutResponse,
    UserCreate,
    UserPublic,
)
from app.modules.auth.service import AuthService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED, summary="Registrarse")
def register(datos: UserCreate, service: ServiceDep):
    return service.registrar(datos)


@router.post("/token", response_model=LoginResponse, summary="Iniciar sesión (formulario OAuth2)")
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response, service: ServiceDep):
    usuario = service.autenticar(form.username, form.password)
    set_auth_cookie(response, create_access_token(usuario.id))
    return LoginResponse()


@router.post("/logout", response_model=LogoutResponse, summary="Cerrar sesión")
def logout(response: Response):
    delete_auth_cookie(response)
    return LogoutResponse()


@router.get("/me", response_model=UserPublic, summary="Usuario autenticado")
def me(usuario: CurrentUser):
    return usuario
