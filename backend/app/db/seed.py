from sqlmodel import Session, func, select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import ROL_ADMIN, ROL_USER, Usuario

USUARIOS = [
    ("admin", "Administrador Food Store", "admin@foodstore.com", "Admin1234!", ROL_ADMIN),
    ("cliente", "Carla Cliente", "cliente@foodstore.com", "Cliente1234!", ROL_USER),
]

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra con masa casera"),
    ("Hamburguesas", "Hamburguesas de carne vacuna con papas"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
    ("Postres", "Dulces caseros"),
]

PRODUCTOS = [
    ("Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 8500, 20, "Pizzas"),
    ("Pizza napolitana", "Muzzarella, tomate en rodajas, ajo y albahaca", 9500, 15, "Pizzas"),
    ("Fugazzeta", "Muzzarella y cebolla", 9200, 10, "Pizzas"),
    ("Hamburguesa clásica", "Carne, lechuga, tomate y queso", 7800, 25, "Hamburguesas"),
    ("Hamburguesa doble", "Doble carne, cheddar y panceta", 10500, 12, "Hamburguesas"),
    ("Hamburguesa veggie", "Medallón de lentejas, lechuga y tomate", 8200, 8, "Hamburguesas"),
    ("Agua mineral 500 ml", "Sin gas", 1500, 50, "Bebidas"),
    ("Gaseosa 1,5 l", "Cola, lima-limón o naranja", 3200, 30, "Bebidas"),
    ("Limonada", "Con menta y jengibre", 2800, 20, "Bebidas"),
    ("Flan casero", "Con dulce de leche", 3200, 10, "Postres"),
    ("Brownie", "Con nueces", 2900, 3, "Postres"),
]


FOTOS = {
    "Pizza muzzarella": "photo-1513104890138-7c749659a591",
    "Pizza napolitana": "photo-1574071318508-1cdbab80d002",
    "Fugazzeta": "photo-1565299624946-b28f40a0ae38",
    "Hamburguesa clásica": "photo-1568901346375-23c9450c58cd",
    "Hamburguesa doble": "photo-1553979459-d2229ba7433b",
    "Hamburguesa veggie": "photo-1525059696034-4967a8e1dca2",
    "Agua mineral 500 ml": "photo-1548839140-29a749e1cf4d",
    "Gaseosa 1,5 l": "photo-1554866585-cd94860890b7",
    "Limonada": "photo-1621263764928-df1444c5e859",
    "Flan casero": "photo-1610360147031-26a1d395726e",
    "Brownie": "photo-1606313564200-e75d5e30476c",
}


ENCUADRES = {
    "Flan casero": "&crop=focalpoint&fp-x=0.45&fp-y=0.62&fp-z=2",
}


def _imagen(nombre: str) -> str:
    encuadre = ENCUADRES.get(nombre, "")
    return f"https://images.unsplash.com/{FOTOS[nombre]}?w=600&h=450&fit=crop{encuadre}&q=75&auto=format"


def cargar_usuarios(session: Session) -> None:
    for username, full_name, email, password, role in USUARIOS:
        if session.exec(select(Usuario).where(Usuario.username == username)).first() is None:
            session.add(
                Usuario(username=username, full_name=full_name, email=email, hashed_password=hash_password(password), role=role)
            )
            print(f"  usuario {username} ({role})")


def cargar_categorias(session: Session) -> dict[str, Categoria]:
    categorias: dict[str, Categoria] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            print(f"  categoría {nombre}")
        categorias[nombre] = categoria
    session.flush()
    return categorias


def cargar_productos(session: Session, categorias: dict[str, Categoria]) -> None:
    for nombre, descripcion, precio, stock, categoria in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
            session.add(
                Producto(
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    stock=stock,
                    imagen_url=_imagen(nombre),
                    categoria_id=categorias[categoria].id,
                )
            )
            print(f"  producto {nombre}")


def main() -> None:
    create_all_tables()
    with session_factory() as session:
        cargar_usuarios(session)
        categorias = cargar_categorias(session)
        cargar_productos(session, categorias)
        session.commit()
    print("Seed completo.")


if __name__ == "__main__":
    main()
