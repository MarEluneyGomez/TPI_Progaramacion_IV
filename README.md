# Food Store · Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia (UTN)

Aplicación web para un negocio de comidas. Los clientes recorren el catálogo, arman un carrito y confirman pedidos con dirección de entrega y forma de pago. El administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

| | |
|---|---|
| **Repositorio** | https://github.com/MarEluneyGomez/TPI_Progaramacion_IV |
| **Video de demostración** | https://youtu.be/OPhZP9u0WAk |

## Contenido

1. [Stack](#stack)
2. [Requisitos](#requisitos)
3. [Backend: instalación y ejecución](#backend-instalación-y-ejecución)
4. [Frontend: instalación y ejecución](#frontend-instalación-y-ejecución)
5. [Usuarios del seed](#usuarios-del-seed)
6. [Variables de entorno](#variables-de-entorno)
7. [Arquitectura del backend](#arquitectura-del-backend)
8. [API REST](#api-rest)
9. [Reglas de negocio](#reglas-de-negocio)
10. [Arquitectura del frontend](#arquitectura-del-frontend)
11. [Decisiones de diseño](#decisiones-de-diseño)
12. [Problemas frecuentes](#problemas-frecuentes)

## Stack

| Capa | Tecnologías |
|---|---|
| Backend | Python 3.11–3.13 · FastAPI · SQLModel · PostgreSQL (psycopg2) · python-jose (JWT) · passlib + bcrypt 4.0.1 · pydantic-settings |
| Frontend | React 19 · TypeScript (`strict`) · Vite · Tailwind CSS 4 · TanStack Query, Form y Table · React Router 7 · Zustand · Axios |

## Requisitos

- Python 3.11, 3.12 o 3.13
- PostgreSQL 15 o superior, en ejecución. Para desarrollo también funciona con SQLite (ver [Variables de entorno](#variables-de-entorno))
- Node.js 20.19 o superior y pnpm 9 o superior

## Backend: instalación y ejecución

Desde la carpeta `backend/`:

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # Windows: copy .env.example .env
#   → editar .env: contraseña de PostgreSQL en DATABASE_URL y una SECRET_KEY propia

python -m app.db.seed              # crea la base, las tablas, los usuarios, las categorías y los productos
uvicorn app.main:app --reload
```

- La base de datos (`foodstore_db`) se crea sola si no existe; no hace falta crearla a mano.
- `python -m app.db.seed` es idempotente: se puede ejecutar varias veces sin duplicar datos.
- API: http://localhost:8000/api/v1 · Swagger: http://localhost:8000/docs · ReDoc: http://localhost:8000/redoc

## Frontend: instalación y ejecución

Desde la carpeta `frontend/`, con el backend corriendo:

```bash
pnpm install
cp .env.example .env               # opcional: por defecto usa http://localhost:8000/api/v1
pnpm build                         # verifica los tipos y genera la versión de producción
pnpm dev                           # http://localhost:5173
```

> Abrir la aplicación en **http://localhost:5173**, no en `127.0.0.1:5173`. La sesión viaja en una cookie: si el frontend y la API usan hosts distintos, el navegador no la envía.

## Usuarios del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `cliente` | `Cliente1234!` | user |

El seed también carga 4 categorías (Pizzas, Hamburguesas, Bebidas y Postres) y 11 productos con stock. Desde `/register` se pueden crear más clientes.

## Variables de entorno

**`backend/.env`** (ver `backend/.env.example`):

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:<contraseña>@localhost:5432/foodstore_db` o, para desarrollo, `sqlite:///./foodstore.db` |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres. Se genera con `python -c "import secrets; print(secrets.token_hex(32))"` | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Vida del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (con credenciales) | `http://localhost:5173` |

**`frontend/.env`** (ver `frontend/.env.example`):

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Arquitectura del backend

Un paquete por dominio en `app/modules/` y, dentro de cada uno, la cadena **Router → Service → Unit of Work → Repository → Model**. Ninguna capa importa de una superior.

```
backend/
├── app/
│   ├── main.py                  FastAPI, CORS con credenciales, routers bajo /api/v1
│   ├── core/
│   │   ├── config.py            Settings (pydantic-settings) leídas de .env
│   │   ├── database.py          engine, create_all_tables y session_factory
│   │   ├── security.py          bcrypt (passlib), create_access_token, decode_access_token, cookie
│   │   ├── deps.py              get_current_user, get_current_active_user, require_role
│   │   ├── unit_of_work.py      UnitOfWork: commit, rollback y close en __exit__
│   │   └── base_repository.py   BaseRepository[T]: get_by_id, get_all, add, delete
│   ├── modules/
│   │   ├── auth/                router, service y schemas (usa el modelo Usuario)
│   │   ├── usuarios/            models, schemas, repository, unit_of_work, service, router
│   │   ├── categorias/          misma cadena de archivos
│   │   ├── productos/           misma cadena de archivos
│   │   └── pedidos/             misma cadena; service.py tiene el mapa de transiciones
│   └── db/seed.py               python -m app.db.seed
├── requirements.txt             versiones fijadas (passlib 1.7.4 y bcrypt 4.0.1)
└── .env.example
```

**Unit of Work.** Cada Service abre `with self.uow as uow:`, aplica las reglas y devuelve el schema de salida dentro del bloque. El `commit` ocurre solo en `UnitOfWork.__exit__` (o `rollback` si hubo una excepción): ningún Service ni Router llama a `session.commit()`. Los Routers obtienen el Service con `Depends(get_<modulo>_service)` y traducen las excepciones de dominio a `HTTPException`.

**Modelo de datos.** Las cinco entidades del diagrama UML: `Usuario`, `Categoria`, `Producto`, `Pedido` y `DetallePedido`. Las relaciones se declaran con `Relationship(back_populates=...)`: `Categoria.productos` / `Producto.categoria`, `Usuario.pedidos` / `Pedido.usuario`, `Pedido.items` / `DetallePedido.pedido` y `Producto.detalles` / `DetallePedido.producto`. La baja lógica usa `disabled` (usuarios) y `activo` (categorías y productos). Los pedidos no se borran: se cancelan.

**Autenticación.** `POST /auth/token` recibe un formulario OAuth2 (`username`, `password`) y entrega el JWT en la cookie HttpOnly `access_token` (30 minutos). El cuerpo de la respuesta no incluye el token. `get_current_user` lee la cookie y valida firma y vencimiento (401); `get_current_active_user` rechaza cuentas desactivadas (400 «Cuenta de usuario desactivada»); `require_role(["admin"])` verifica el rol (403). En Swagger, la cookie se obtiene ejecutando `POST /api/v1/auth/token` con *Try it out*.

## API REST

Prefijo `/api/v1`. Códigos comunes: **401** sin sesión válida, **400** cuenta desactivada, **403** rol no permitido, **422** validación del schema. Los listados paginados reciben `skip` y `limit` (0 y 20 por defecto, máximo 100) y devuelven `{ "total": N, "items": [...] }`.

| Método | Endpoint | Acceso | Respuesta | Errores propios |
|---|---|---|---|---|
| POST | `/auth/register` | Público | 201 `UserPublic` | 409 usuario o email repetido |
| POST | `/auth/token` | Público | 200 `{"message": "Login exitoso"}` + cookie | 401 credenciales; 400 desactivada |
| POST | `/auth/logout` | Público | 200, borra la cookie | — |
| GET | `/auth/me` | Sesión | 200 `UserPublic` | — |
| GET | `/admin/usuarios` | admin | 200 `list[UserPublic]` | — |
| POST | `/admin/usuarios/{id}/activar` | admin | 200 `UserPublic` | 404 |
| POST | `/admin/usuarios/{id}/desactivar` | admin | 200 `UserPublic` | 404; 400 si es él mismo |
| GET | `/categorias` | Público | 200 `list[CategoriaRead]` (activas) | — |
| GET | `/categorias/{id}` | Público | 200 `CategoriaRead` | 404 |
| POST | `/categorias` | admin | 201 `CategoriaRead` | 409 nombre repetido |
| PUT | `/categorias/{id}` | admin | 200 `CategoriaRead` | 404, 409 |
| DELETE | `/categorias/{id}` | admin | 204 (baja lógica) | 404 |
| GET | `/productos` | Público | 200 `ProductosPaginados` (`search`, `categoria_id`, `disponible`) | — |
| GET | `/productos/{id}` | Público | 200 `ProductoRead` | 404 |
| POST | `/productos` | admin | 201 `ProductoRead` | 404 categoría inexistente o dada de baja |
| PUT | `/productos/{id}` | admin | 200 `ProductoRead` (parcial) | 404 |
| PATCH | `/productos/{id}/stock` | admin | 200 `ProductoRead` | 404 |
| DELETE | `/productos/{id}` | admin | 204 (baja lógica) | 404 |
| POST | `/pedidos` | Sesión | 201 `PedidoRead` | 404 producto; 400 stock, no disponible o repetido |
| GET | `/pedidos` | Sesión | 200 `PedidosPaginados` (propios o todos si es admin; `estado`) | — |
| GET | `/pedidos/resumen` | admin | 200 `ResumenPedidos` | — |
| GET | `/pedidos/{id}` | Dueño o admin | 200 `PedidoRead` | 404; 403 ajeno |
| PATCH | `/pedidos/{id}/estado` | admin | 200 `PedidoRead` | 404; 400 transición inválida |
| PATCH | `/pedidos/{id}/cancelar` | Dueño | 200 `PedidoRead` | 404; 403 ajeno; 400 si no está PENDIENTE |

Un registro dado de baja se trata como inexistente (404). `PUT` actualiza solo los campos enviados.

## Reglas de negocio

| Regla | Implementación |
|---|---|
| **RN-01** Crear pedido | Al menos un ítem y sin productos repetidos. Por cada ítem, en la misma iteración: el producto debe existir, estar activo y disponible y tener stock; se descuenta el stock y se crea la línea copiando `nombre_producto` y `precio_unitario`. Todo en un Unit of Work: si una validación falla, se hace rollback y no se persiste nada (tampoco el descuento de stock). Los productos se leen con `SELECT ... FOR UPDATE` para que dos pedidos simultáneos no vendan el mismo stock |
| **RN-02** Transiciones | Mapa `TRANSICIONES` en `pedidos/service.py`: `PENDIENTE → EN_PREPARACION / CANCELADO`, `EN_PREPARACION → ENTREGADO / CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales. Una transición inválida responde 400 |
| **RN-03** Cancelar | Restituye el stock de cada línea en la misma transacción que cambia el estado |
| **RN-04** Permisos | El cliente solo ve sus pedidos (403 si es ajeno) y solo cancela desde `PENDIENTE`. El admin ve todos y avanza o cancela desde cualquier estado no terminal |
| **RN-05** Inmutabilidad | Las líneas y el total no cambian después de crear el pedido: no hay endpoints de edición ni de borrado de pedidos |
| **RN-06** Datos del pedido | `forma_pago` es `EFECTIVO` o `TRANSFERENCIA` y `direccion_entrega` tiene entre 5 y 200 caracteres (validado en el schema) |

## Arquitectura del frontend

Organizado por features que espejan los módulos del backend. Cada feature tiene `pages/`, `components/`, `hooks/`, `api/` y `types/`.

```
frontend/src/
├── shared/
│   ├── api/          axiosInstance.ts (withCredentials + interceptor de 401), handleApiError.ts, queryClient.ts
│   ├── ui/           Button, Card, Input, Select, Checkbox, Modal, BadgeEstado
│   ├── components/   Paginacion, Skeleton, EstadoVacio, EstadoError, TablaDatos, EncabezadoPagina
│   ├── layout/       Navbar (nombre, rol, carrito, cerrar sesión, panel solo para admin) y MainLayout
│   ├── hooks/        useDebouncedValue
│   └── utils/        formato y validaciones de formularios
├── features/
│   ├── auth/         LoginPage, RegisterPage, UnauthorizedPage
│   ├── categorias/   AdminCategoriasPage, useCategorias
│   ├── productos/    CatalogoPage, AdminProductosPage, ProductoCard, ProductoForm, StockForm, useProductos
│   ├── usuarios/     AdminUsuariosPage, useUsuarios
│   └── pedidos/      CarritoPage, CheckoutPage, MisPedidosPage, AdminPedidosPage, AdminResumenPage,
│                     usePedidos, useCrearPedido, useCambiarEstadoPedido, useCancelarPedido, useResumenPedidos
├── store/            authStore.ts y cartStore.ts (Zustand + persist)
├── routes/           AppRouter.tsx (BrowserRouter) y ProtectedRoute.tsx
├── App.tsx           checkSession al montar y AppRouter
└── main.tsx          QueryClientProvider
```

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Catálogo paginado en el servidor, con búsqueda, filtro por categoría, skeleton y estado vacío | Público |
| `/carrito` | Ítems, cantidades, subtotales y total; persiste al recargar | Público |
| `/login`, `/register`, `/unauthorized` | Formularios con TanStack Form y acceso denegado | Público |
| `/checkout` | Dirección, forma de pago y notas; crea el pedido, vacía el carrito y va a «Mis pedidos» | Sesión |
| `/mis-pedidos` | Pedidos propios con detalle; cancelar solo en `PENDIENTE` | Sesión |
| `/admin/resumen` | Tarjetas con los indicadores | admin |
| `/admin/categorias`, `/admin/productos` | ABM con TanStack Table (paginación del lado del cliente, `limit=100`) y TanStack Form; stock y disponibilidad | admin |
| `/admin/pedidos` | Filtro por estado y botones según la máquina de estados | admin |
| `/admin/usuarios` | Activar y desactivar (sin «Desactivar» en la fila propia) | admin |

**Estado.** TanStack Query maneja el estado del servidor (catálogo, pedidos, usuarios y resumen) con `queryKey` descriptivas (`['productos', filtros]`) e invalidación en `onSuccess`. Zustand maneja el estado del cliente: `authStore` (usuario, cargando, `login`, `logout`, `checkSession`; `persist` guarda solo el usuario, nunca el token) y `cartStore` (ítems, `agregar`, `quitar`, `cambiarCantidad`, `vaciar`, `total`; `persist`). La única llamada dentro de un `useEffect` es `checkSession` al montar la aplicación.

**Sesión.** El navegador adjunta la cookie HttpOnly en cada petición (`withCredentials: true`); el frontend nunca lee ni guarda el token. Ante un 401 (salvo en `/auth/token` y `/auth/me`) o un 400 «Cuenta de usuario desactivada», el interceptor de Axios limpia el `authStore` y `ProtectedRoute` lleva al login. `ProtectedRoute` muestra un indicador mientras `checkSession` confirma la sesión, redirige a `/login` sin sesión (y después del login vuelve a la página pedida) y a `/unauthorized` sin el rol. Ocultar botones no reemplaza a `require_role`: el backend valida cada petición.

## Decisiones de diseño

- **Precios congelados.** `DetallePedido` copia el nombre y el precio del producto. Si después cambian, el pedido conserva lo que se cobró, y `total` queda fijo desde la creación.
- **Baja lógica.** Dar de baja una categoría no oculta sus productos ni libera su nombre, como pide la consigna: para retirarla del catálogo se dan de baja también sus productos.
- **Roles leídos de la base.** El JWT solo identifica al usuario (`sub`). El rol y el estado se leen en cada petición, así que desactivar una cuenta tiene efecto inmediato.
- **Contraseñas.** Se guardan con bcrypt. Una contraseña de más de 72 bytes (el límite de bcrypt) se rechaza en lugar de truncarse en silencio. El login con un usuario inexistente igual verifica un hash, para que la respuesta tarde lo mismo y no revele qué usuarios existen.
- **Carrito con tope de stock.** El carrito no deja pedir más unidades que el stock conocido. El backend vuelve a validar el stock al crear el pedido.
- **Panel cargado bajo demanda.** Las pantallas de administración se cargan con `React.lazy`: un cliente nunca descarga ese código.

## Problemas frecuentes

| Síntoma | Solución |
|---|---|
| `RuntimeError: No se pudo conectar a PostgreSQL...` | El servidor no está corriendo o la contraseña de `DATABASE_URL` en `backend/.env` es incorrecta |
| `ValidationError ... SECRET_KEY` al levantar el backend | Falta `backend/.env` o la `SECRET_KEY` tiene menos de 32 caracteres |
| El login funciona pero después todo da 401 | El frontend se abrió en `127.0.0.1` y la API está en `localhost` (o al revés). Usar `localhost` en los dos |
| Error de CORS en la consola | El origen del frontend no coincide con `FRONTEND_ORIGIN` (por ejemplo, Vite levantó en el puerto 5174) |
| `OSError ... No such file or directory` al hacer `pip install` en Windows | La ruta del proyecto es muy larga para Windows. Crear el entorno virtual en una ruta corta (`python -m venv C:\venvs\foodstore`) o habilitar `LongPathsEnabled` |
