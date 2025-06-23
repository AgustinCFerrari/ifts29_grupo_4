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
import historiaClinicaRoutes  from './routes/historiaClinicaRoutes.js';
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
//import Mascota from './clases/Mascota.js';
//import Turno from './clases/Turno.js';

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
//const MASCOTAS_FILE = './data/mascotas.json';
const USUARIOS_FILE = './data/usuarios.json';
//const TURNOS_FILE = './data/turnos.json';

// Middleware para procesar los datos que llegan en formularios HTML 
app.use(express.urlencoded({ extended: true }));

// Middleware para procesar datos JSON en las peticiones HTTP.
app.use(express.json());

// Define que todas las rutas que empiecen con '/api/*******' serán manejadas por *******
app.use(historiaClinicaRoutes);
app.use(mascotaRoutes);
app.use(turnoRoutes);

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
  // 🔐 Guardar en sesión
  req.session.usuario = { username: user.username, rol: user.rol }; // Guarda usuario y rol en la sesión
  res.render('menu', { usuario: req.session.usuario, rol: user.rol });
});

// Middleware de Autorización por Rol
function autorizar(rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.session?.usuario?.rol; // simulación de rol por query string
    if (!rol || !rolesPermitidos.includes(rol)) {
      return res.status(403).render('error-autorizacion', { mensaje: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
}

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
  res.render('editar-producto', { producto });
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

// ================================
// CRUD de Mascotas
// ================================

/* // Función para leer mascotas desde el archivo JSON
const leerMascotas = async () => {
  try {
    const data = await readFile(MASCOTAS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Función para guardar mascotas en el archivo JSON
const escribirMascotas = async (data) => {
  await writeFile(MASCOTAS_FILE, JSON.stringify(data, null, 2));
};

// Ruta GET /mascotas  Muestra el listado de mascotas y un formulario
// para agregar nuevas mascotas.
app.get('/mascotas', async (req, res) => {
  const mascotas = await leerMascotas();
  res.render('mascotas', { mascotas });
});

// Ruta POST /mascotas  Crea una nueva mascota
app.post('/mascotas', async (req, res) => {
  const { id, nombre, especie, raza, anioNacimiento, responsable } = req.body;
  if (!id || !nombre || !especie || !raza || !anioNacimiento || !responsable) {
    return res.status(400).render('error-mascota', { mensaje: 'Faltan campos' });
  }
  const mascotas = await leerMascotas();
  if (mascotas.find(m => m.id == id)) {
    return res.status(409).render('error-mascota', { mensaje: 'ID ya registrado' });
  }
  const nueva = new Mascota(id, nombre, especie, raza, anioNacimiento, responsable);
  mascotas.push(nueva);
  await escribirMascotas(mascotas);
  res.redirect('/mascotas');
});

// Ruta GET /mascotas/:id/editar  Muestra el formulario para editar una mascota específica.
app.get('/mascotas/:id/editar', async (req, res) => {
  const mascotas = await leerMascotas();
  const mascota = mascotas.find(m => m.id == req.params.id);
  if (!mascota) return res.status(404).render('error-mascota', { mensaje: 'Mascota no encontrada' });
  res.render('editar-mascota', { mascota });
});

// Ruta POST /mascotas/:id/editar  Actualiza los datos del formulario de edición de una mascota.
app.post('/mascotas/:id/editar', async (req, res) => {
  const { nombre, especie, raza, anioNacimiento, responsable } = req.body;
  const mascotas = await leerMascotas();
  const index = mascotas.findIndex(m => m.id == req.params.id);
  if (index === -1) return res.status(404).render('error-mascota', { mensaje: 'Mascota no encontrada' });
  mascotas[index] = { ...mascotas[index], nombre, especie, raza, anioNacimiento: parseInt(anioNacimiento), responsable };
  await escribirMascotas(mascotas);
  res.redirect('/mascotas');
});

// Ruta POST /mascotas/:id/eliminar  Elimina una mascota específica.
app.post('/mascotas/:id/eliminar', async (req, res) => {
  const mascotas = await leerMascotas();
  const nuevas = mascotas.filter(m => m.id != req.params.id);
  await escribirMascotas(nuevas);
  res.redirect('/mascotas');
});

// =========================================
// Buscador de Mascotas por nombre o especie
// =========================================
app.get('/mascotas/buscar', async (req, res) => {
  const { nombre, especie } = req.query;
  const mascotas = await leerMascotas();
  let resultado = mascotas;

  if (nombre) {
    resultado = resultado.filter(m => m.nombre.toLowerCase().includes(nombre.toLowerCase()));
  }
  if (especie) {
    resultado = resultado.filter(m => m.especie.toLowerCase().includes(especie.toLowerCase()));
  }

  res.render('mascotas_busqueda', { mascotas: resultado });
});

// ======================================
// Formulario visual para buscar mascotas
// ======================================
app.get('/formulario-busqueda', async(req, res) => {
  res.render('formulario_busqueda_mascotas');
}); */

// ================================
// CRUD de Turnos
// ================================

/*//Función para leer turnos desde el archivo JSON
const leerTurnos = async () => {
  try {
    const data = await readFile(TURNOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Función para guardar turnos en el archivo JSON
const escribirTurnos = async (data) => {
  await writeFile(TURNOS_FILE, JSON.stringify(data, null, 2));
};

// Ruta GET /turnos  Muestra el listado de turnos y un formulario
// para agregar nuevos turnos.
app.get('/turnos', async (req, res) => {
  const turnos = await leerTurnos();
  res.render('turnos', { turnos });
});

// Ruta POST /turnos  Crea un nuevo turno
app.post('/turnos', async (req, res) => {
  const {id, servicio, fecha, hora, mascota, duenio } = req.body;
  const nuevo = {id, servicio, fecha, hora, mascota, duenio};
  if (!id || !servicio || !fecha || !hora || !mascota || !duenio) {
  return res.status(400).render('error-turno', { mensaje: 'Faltan campos' });
  }
  const turnos = await leerTurnos();
  if (turnos.find(t => t.id == id)) {
  return res.status(409).render('error-turno', { mensaje: 'ID ya registrado' });
  }
  const nueva = new Turno(id, servicio, fecha, hora, mascota, duenio);
  turnos.push(nueva);
  await escribirTurnos(turnos);
  res.redirect('/turnos');
});

// Ruta GET /turnos/:id  Muestra los detalles de un turno específico según su ID.
app.get('/turnos/:id/editar', async (req, res) => {
  const turnos = await leerTurnos();
  const turno = turnos.find(t => t.id == req.params.id);
  if (!turno) return res.status(404).render('error-turno', { mensaje: 'Turno no encontrado' });
  res.render('editar-turno', { turno });
});

// Ruta POST /turnos/:id/editar  Actualiza los datos del formulario de edición de un turno.
app.post('/turnos/:id/editar', async (req, res) => {
  const { servicio, fecha, hora, mascota, duenio } = req.body;
  const turnos = await leerTurnos();
  const index = turnos.findIndex(t => t.id == req.params.id);
  if (index === -1) return res.status(404).render('error-turno', { mensaje: 'Turno no encontrado' });
  turnos[index] = { ...turnos[index], servicio, fecha, hora, mascota, duenio };
  await escribirTurnos(turnos);
  res.redirect('/turnos');
});

// Ruta POST /turnos/:id/eliminar  Elimina un turno específico.
app.post('/turnos/:id/eliminar', async (req, res) => {
  const turnos = await leerTurnos();
  const nuevos = turnos.filter(t => t.id != req.params.id);
  await escribirTurnos(nuevos);
  res.redirect('/turnos');
});*/

// ================================
// Iniciar servidor
// ================================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


