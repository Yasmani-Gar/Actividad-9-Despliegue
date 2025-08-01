CRUD-LISTA
Esta es una aplicación web para la gestión de productos que incluye funcionalidades CRUD (Crear, Leer, Actualizar, Eliminar) y un registro de historial. La aplicación utiliza un backend basado en Node.js con Express y una base de datos SQLite, junto con un frontend simple implementado en HTML, CSS y JavaScript.
Estructura del Proyecto
El proyecto tiene la siguiente estructura de carpetas y archivos:
CRUD-LISTA/
├── backend/
├── node_modules/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── script.js
│   ├── styles.css
├── database.db
├── database.js
├── package-lock.json
├── package.json
├── server.js
├── test.js
└── README.md


public/: Contiene los archivos del frontend (HTML, JavaScript y CSS). Este nombre se eligió como estándar en proyectos Node.js/Express para indicar la carpeta que sirve archivos estáticos accesibles al público. Se decidió colocarla dentro de la raíz del proyecto (junto al backend) en lugar de tenerla como una carpeta independiente al mismo nivel o dentro de una subcarpeta específica, para mantener una estructura simplificada y facilitar que el backend (server.js) sirva estos archivos directamente mediante express.static('public'). En proyectos más grandes con un frontend complejo (e.g., React o Vue), una separación como carpeta independiente (e.g., al lado de backend/) sería más adecuada, pero aquí se priorizó la integración directa y la compacidad.
backend/: Carpeta reservada para lógica o configuraciones adicionales del backend. Actualmente está vacía o no se ha especificado contenido; si contiene archivos, por favor detállalos en esta sección.
node_modules/: Carpeta generada por npm que contiene las dependencias instaladas.
database.db: Archivo de la base de datos SQLite que almacena los datos de usuarios, productos e historial.
database.js: Configura la conexión y operaciones con la base de datos SQLite.
package-lock.json: Archivo de bloqueo de dependencias generado por npm para asegurar consistencia en las instalaciones.
package.json: Define las dependencias y scripts del proyecto.
server.js: Contiene la lógica del backend, incluyendo las rutas API y la autenticación.
README.md: Este archivo con la documentación del proyecto.

Dependencias
Las dependencias necesarias se gestionan a través de npm y están listadas en el package.json. Instálalas ejecutando:
npm install

Dependencias principales

express: Framework para el servidor Node.js.
cors: Middleware para habilitar CORS y permitir solicitudes desde el frontend.
bcryptjs: Biblioteca para hashear contraseñas de los usuarios.
jsonwebtoken: Para generar y verificar tokens JWT para autenticación.
better-sqlite3: Driver para interactuar con la base de datos SQLite (asegúrate de tenerlo instalado si usas este módulo; en este caso, se asume que está configurado en database.js).

Dependencias de desarrollo (opcional)

nodemon: Para reiniciar automáticamente el servidor durante el desarrollo (usado en el script dev).

Instrucciones de Instalación

Clona o descarga el repositorio:

Si tienes un repositorio Git, clona el proyecto:git clone <url-del-repositorio>
cd CRUD-LISTA


O descarga el código manualmente y descomprímelo en una carpeta.


Instala las dependencias:

Ejecuta el siguiente comando en la raíz del proyecto:npm install




Configura la base de datos:

Asegúrate de que el archivo database.js esté configurado correctamente para conectar a database.db.
Crea o actualiza la base de datos ejecutando el siguiente script SQL (guárdalo como schema.sql y ejecútalo con SQLite):CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL,
    price REAL NOT NULL
);

CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('creado', 'actualizado', 'eliminado')),
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (name, email, password) VALUES 
('Admin', 'admin@example.com', 'hashed_password_123');




Inicia el servidor:

Para desarrollo (con reinicio automático):npm run dev


O para producción:node server.js


El servidor se ejecutará en http://localhost:3000.


Accede a la aplicación:

Abre tu navegador y visita http://localhost:3000. Serás redirigido a la página de inicio de sesión (login.html).
Usa las credenciales iniciales: admin@example.com / 123 (cambia la contraseña después de iniciar sesión).



Instrucciones de Uso

Inicio de sesión: Ingresa con un usuario registrado o regístrate si es la primera vez.
Gestión de productos: Una vez autenticado, puedes agregar, editar, eliminar productos y ver el historial de acciones.
Historial: Haz clic en "Recargar Historial" para actualizar la lista de acciones realizadas.

Notas Adicionales

La zona horaria está configurada como America/Bogota (-05:00) en el backend para asegurar que las fechas se guarden y muestren correctamente.
El frontend es estático y servido por el backend. Para proyectos más complejos, considera separar el frontend en una carpeta independiente y usar un framework como React.
Asegúrate de cambiar la clave secreta JWT_SECRET en server.js a un valor seguro en producción.
El archivo test.js se asume como un script de pruebas; si tiene otro propósito, actualiza esta descripción.

Contribuciones
Si deseas contribuir, por favor abre un issue o envía un pull request con tus cambios.
Licencia
Derechos de Copyright.