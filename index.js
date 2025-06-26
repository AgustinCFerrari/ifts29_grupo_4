// =============================================
// index.js - Backend con Express
// Manejo de login, productos, mascotas y turnos
// =============================================

// Importamos Express para crear el servidor web.
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importamos las rutas de mascotas, turnos y productos desde archivos separados.
import mascotaRoutes from './routes/mascotaRoutes.js';
import turnoRoutes from './routes/turnoRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

// Importamos el controlador de usuario para manejar el login.
import { login } from './controllers/usuarioController.js';

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
});

// =================
// LOGIN DEL SISTEMA
// =================

// Ruta principal: muestra login
app.get('/', (req, res) => {
  res.render('login');
});

// Procesa los datos del login y valida usuario/contraseña
app.post('/login', login);

// Define que todas las rutas 
app.use(mascotaRoutes);
app.use(turnoRoutes);
app.use(productoRoutes);
app.use(usuarioRoutes);

// Pantalla de Menú
app.get('/menu', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/'); 
  }
  res.render('menu', { usuario: req.session.usuario });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


