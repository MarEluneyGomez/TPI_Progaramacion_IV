from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]
UsuarioId = Annotated[int, Path(gt=0)]


@router.get("", response_model=list[UserPublic], summary="Listar usuarios (admin)")
def listar_usuarios(_: AdminUser, service: ServiceDep):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic, summary="Activar un usuario (admin)")
def activar_usuario(usuario_id: UsuarioId, _: AdminUser, service: ServiceDep):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.post("/{usuario_id}/desactivar", response_model=UserPublic, summary="Desactivar un usuario (admin)")
def desactivar_usuario(usuario_id: UsuarioId, admin: AdminUser, service: ServiceDep):
    try:
        return service.desactivar(usuario_id, admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except AutoDesactivacion as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e
