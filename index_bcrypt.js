import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { readFile, writeFile } from 'fs/promises';
import mascotaRoutes from './routes/mascotaRoutes.js';
import turnoRoutes from './routes/turnoRoutes.js';

const app = express();
const PORT = 3000;

const USUARIOS_FILE = './data/usuarios.json';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'huellitas-sesion-segura',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'pug');
app.set('views', './views');

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario;
  next();
});

// Ruta de login usando bcrypt
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const data = await readFile(USUARIOS_FILE, 'utf-8');
  const usuarios = JSON.parse(data);

  const user = usuarios.find(u => u.username === username);
  if (!user) {
    return res.status(401).render('error-login', { mensaje: 'Usuario o contraseña incorrectos' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).render('error-login', { mensaje: 'Usuario o contraseña incorrectos' });
  }

  req.session.usuario = { username: user.username, rol: user.rol };
  res.render('menu', { usuario: req.session.usuario });
});

// Ruta de registro para crear usuario con bcrypt
app.get('/registro', (req, res) => {
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

app.use(mascotaRoutes);
app.use(turnoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});