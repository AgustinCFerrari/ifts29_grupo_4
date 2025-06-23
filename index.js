// =============================================
// index.js - Backend con Express
// Manejo de login, productos, mascotas y turnos
// =============================================

// Importamos Express para crear el servidor web.
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importamos las rutas de historias clínicas desde archivos separados.
import mascotaRoutes from './routes/mascotaRoutes.js';
import turnoRoutes from './routes/turnoRoutes.js';

// Importamos funciones de lectura y escritura de archivos
// Estas funciones nos permiten leer y escribir datos en archivos 
// JSON de manera asincrónica.
import { readFile, writeFile } from 'fs/promises';

// Cargamos las variables de entorno desde un archivo .env
dotenv.config();

// Importamos la clases Productos, Mascotas y Turnos desde un archivo separado.
import Producto from './clases/Producto.js';

// Creamos una instancia de la aplicación Express que manejará las peticiones.
const app = express();

// Definimos el puerto en el que escuchará el servidor.
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB local
mongoose.connect(process.env.MONGO_URI) // Conecta a MongoDB usando la URI definida en las variables de entorno
  .then(() => console.log('Conectado a MongoDB')) 
  .catch(err => console.error(err));

// Definimos la ruta de los archivos JSON que usaremos como "base de datos".
const PRODUCTOS_FILE = './data/productos.json';
const USUARIOS_FILE = './data/usuarios.json';

// Importamos Middleware para autorizacion segun el rol del usuario
import { autorizar } from './middlewares/autorizar.js';

// Middleware para procesar los datos que llegan en formularios HTML 
app.use(express.urlencoded({ extended: true }));

// Middleware para procesar datos JSON en las peticiones HTTP.
app.use(express.json());


// Configuramos Pug como el motor de plantillas para renderizar las vistas en el servidor
app.set('view engine', 'pug');
app.set('views', './views');

// Middleware de sesión
app.use(session({
  secret: 'huellitas-sesion-segura',
  resave: false,
  saveUninitialized: true
}));

// Pasar datos del usuario logueado a todas las vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario;
  next();
}); // Definimos la carpeta de vistas

// Define que todas las rutas que empiecen con '/api/*******' serán manejadas por *******
app.use(mascotaRoutes);
app.use(turnoRoutes);


// =================
// LOGIN DEL SISTEMA
// =================

// Ruta principal: muestra login
app.get('/', (req, res) => {
  res.render('login');
});

// Procesa los datos del login y valida usuario/contraseña
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const data = await readFile(USUARIOS_FILE, 'utf-8');
  const usuarios = JSON.parse(data);
  const user = usuarios.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).render('error-login', { mensaje: 'Usuario o contraseña incorrectos' });
  // Guardar en sesión
  req.session.usuario = { username: user.username, rol: user.rol }; // Guarda usuario y rol en la sesión
  res.render('menu', { usuario: req.session.usuario, rol: user.rol });
});

/*// Middleware de Autorización por Rol
function autorizar(rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.session?.usuario?.rol; // simulación de rol por query string
    if (!rol || !rolesPermitidos.includes(rol)) {
      return res.status(403).render('error-autorizacion', { mensaje: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
}*/

// Pantalla de Menú
app.get('/menu', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/'); // volver al login si no está logueado
  }
  res.render('menu', { usuario: req.session.usuario });
});

// ================================
// CRUD de Productos
// ================================

// Función para leer productos desde el archivo JSON
const leerProductos = async () => {
  try {
    const data = await readFile(PRODUCTOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Función para guardar productos en el archivo JSON
const escribirProductos = async (data) => {
  await writeFile(PRODUCTOS_FILE, JSON.stringify(data, null, 2));
};

// Ruta GET /productos 
// Muestra el listado de productos y un formulario 
// para agregar nuevos productos.
app.get('/productos', async (req, res) => {
  const productos = await leerProductos();
  res.render('productos', { productos });
});

// Ruta GET /productos/:id  Muestra los detalles de un producto específico según su ID.
app.get('/productos/:id', async (req, res) => {
  const productos = await leerProductos();
  const producto = productos.find(p => p.id == req.params.id);
  if (!producto) return res.status(404).render('error-producto', { mensaje: 'Producto no encontrado' });
  res.render('nuevo-producto', { producto });
});

// Ruta POST /productos Recibe los datos de un formulario 
// y guarda un nuevo producto en el archivo JSON.
app.post('/productos', async (req, res) => {
  const { id, precio, stock, categoria } = req.body;
  if (!id || !precio || !stock || !categoria) {
    return res.status(400).render('error-producto', { mensaje: 'Faltan campos' });
  }
  const productos = await leerProductos();
  if (productos.find(p => p.id == id)) {
    return res.status(409).render('error-producto', { mensaje: 'ID existente' });
  }
  const nuevo = new Producto(parseInt(id), precio, stock, categoria);
  productos.push(nuevo);
  await escribirProductos(productos);
  res.render('nuevo-producto', { producto: nuevo });
});

// Ruta GET /productos/:id/editar  Muestra el formulario para editar un producto específico.
app.get('/productos/:id/editar', autorizar(['administrador']), async (req, res) => {
  const productos = await leerProductos();
  const producto = productos.find(p => p.id == req.params.id);
  if (!producto) return res.status(404).render('error-producto', { mensaje: 'Producto no encontrado' });
  res.render('editar_producto', { producto });
});

// Ruta POST /productos/:id/editar  Actualiza los datos del formulario de edición de un producto.
app.post('/productos/:id/editar', async (req, res) => {
  const { precio, stock, categoria } = req.body;
  const productos = await leerProductos();
  const index = productos.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).render('error-producto', { mensaje: 'Producto no encontrado' });
  productos[index].precio = parseFloat(precio);
  productos[index].stock = parseInt(stock);
  productos[index].categoria = categoria;
  await escribirProductos(productos);
  res.redirect('/productos');
});

// Ruta POST /productos/:id/eliminar  Elimina un producto específico.
app.post('/productos/:id/eliminar', autorizar(['administrador']), async (req, res) => {
  const productos = await leerProductos();
  const nuevos = productos.filter(p => p.id != req.params.id);
  await escribirProductos(nuevos);
  res.redirect('/productos');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


