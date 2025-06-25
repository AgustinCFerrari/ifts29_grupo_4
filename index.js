// =============================================
// index.js - Backend con Express
// Manejo de login, productos, mascotas y turnos
// =============================================

// Importamos Express para crear el servidor web.
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importamos las rutas de mascotas, turnos y productos desde archivos separados.
import mascotaRoutes from './routes/mascotaRoutes.js';
import turnoRoutes from './routes/turnoRoutes.js';
import productoRutes from './routes/productoRoutes.js';

// Importamos funciones de lectura y escritura de archivos
// Estas funciones nos permiten leer y escribir datos en archivos 
// JSON de manera asincrónica.
import { readFile, writeFile } from 'fs/promises';

// Cargamos las variables de entorno desde un archivo .env
dotenv.config();

// Creamos una instancia de la aplicación Express que manejará las peticiones.
const app = express();

// Definimos el puerto en el que escuchará el servidor.
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB local
mongoose.connect(process.env.MONGO_URI) // Conecta a MongoDB usando la URI definida en las variables de entorno
  .then(() => console.log('Conectado a MongoDB')) 
  .catch(err => console.error(err));

// Definimos la ruta de los archivos JSON que usaremos como "base de datos".
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
  const user = usuarios.find(u => u.username === username);
  if (!user) return res.status(401).render('error-login', { mensaje: 'Usuario o contraseña incorrectos' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).render('error-login', { mensaje: 'Usuario o contraseña incorrectos' });
  }
  // Guardar en sesión
  req.session.usuario = { username: user.username, rol: user.rol }; // Guarda usuario y rol en la sesión
  res.render('menu', { usuario: req.session.usuario, rol: user.rol });
});

// Ruta de registro para crear usuario con bcrypt
app.get('/registro', autorizar(['administrador']), (req, res) => {
  res.render('registro');
});

app.post('/registro', async (req, res) => {
  const { username, password, rol } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const data = await readFile(USUARIOS_FILE, 'utf-8');
  const usuarios = JSON.parse(data);
  usuarios.push({ username, password: hashedPassword, rol });

  await writeFile(USUARIOS_FILE, JSON.stringify(usuarios, null, 2));
  res.redirect('/');
});

// Define que todas las rutas 
app.use(mascotaRoutes);
app.use(turnoRoutes);
app.use(productoRutes);

// Pantalla de Menú
app.get('/menu', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/'); // volver al login si no está logueado
  }
  res.render('menu', { usuario: req.session.usuario });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


