from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])
SOLO_ADMIN = [Depends(require_role(["admin"]))]


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
CategoriaId = Annotated[int, Path(gt=0)]


@router.get("", response_model=list[CategoriaRead], summary="Listar categorías activas")
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead, summary="Detalle de una categoría")
def obtener_categoria(categoria_id: CategoriaId, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=SOLO_ADMIN,
    summary="Crear una categoría (admin)",
)
def crear_categoria(datos: CategoriaCreate, service: ServiceDep):
    try:
        return service.crear(datos)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=SOLO_ADMIN, summary="Actualizar una categoría (admin)")
def actualizar_categoria(categoria_id: CategoriaId, datos: CategoriaUpdate, service: ServiceDep):
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=SOLO_ADMIN,
    summary="Baja lógica de una categoría (admin)",
)
def eliminar_categoria(categoria_id: CategoriaId, service: ServiceDep):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
