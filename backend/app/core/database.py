from sqlalchemy import event, text
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.exc import OperationalError
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine: Engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.es_sqlite else {},
)

if settings.es_sqlite:

    @event.listens_for(engine, "connect")
    def _activar_claves_foraneas(conexion, _registro) -> None:
        cursor = conexion.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def _crear_base_si_no_existe() -> None:
    url = make_url(settings.DATABASE_URL)
    admin = create_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    try:
        with admin.connect() as conexion:
            existe = conexion.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :nombre"), {"nombre": url.database}
            ).first()
            if existe is None:
                nombre = admin.dialect.identifier_preparer.quote(url.database)
                conexion.execute(text(f"CREATE DATABASE {nombre}"))
    except (OperationalError, UnicodeDecodeError) as e:
        raise RuntimeError(
            f"No se pudo conectar a PostgreSQL en {url.host}:{url.port or 5432} con el usuario '{url.username}'. "
            "Revisá que el servidor esté corriendo y que DATABASE_URL en .env tenga el usuario y la contraseña correctos."
        ) from e
    finally:
        admin.dispose()


def create_all_tables() -> None:
    if not settings.es_sqlite:
        _crear_base_si_no_existe()

    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)
