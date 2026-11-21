from collections.abc import Sequence

from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.username == username.strip().lower())).first()

    def get_by_email(self, email: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.email == email.strip().lower())).first()

    def list_todos(self) -> Sequence[Usuario]:
        return self.session.exec(select(Usuario).order_by(col(Usuario.id))).all()
