import bcrypt from 'bcrypt';
// Importa el modelo "Usuario" desde la ruta especificada.
import Usuario from '../models/Usuario.js';

// Login con verificación desde MongoDB
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Usuario.findOne({ username });

    if (!user) {
      return res.status(401).render('error-login', { mensaje: 'Usuario o contraseña incorrectos' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).render('error-login', { mensaje: 'Usuario o contraseña incorrectos' });
    }

    req.session.usuario = { username: user.username, rol: user.rol };
    res.render('menu', { usuario: req.session.usuario });

  } catch (err) {
    res.status(500).render('error-autorizacion', { mensaje: err.message });
  }
};


// Controlador para registrar una nuevo usuario
export const crearUsuario = async (req, res) => {
  try {
    const { username, password, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({ username, password: hashedPassword, rol });
    await nuevoUsuario.save();
    const usuarios = await Usuario.find(); 
    res.render('usuarios', { usuarios });
  } catch (err) {
    res.status(400).render('error-autorizacion', { mensaje: err.message });
  }
};

// Controlador para obtener todos las usuarios registrados
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.render('usuarios', { usuarios });
  } catch (err) {
    res.status(500).render('error-autorizacion', { mensaje: err.message });
  }
};

// Controlador para actualizar un usuario por su ID
export const actualizarUsuario = async (req, res) => {
  try {
    const { username, password, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await Usuario.updateOne(
      { _id: req.params.id },
      { $set: { username, password: hashedPassword, rol } }
    );
    const usuarios = await Usuario.find();
    res.render('usuarios', { usuarios });
  } catch (err) {
    res.status(400).render('error-autorizacion', { mensaje: err.message });
  }
};

// Controlador para eliminar un usuario por su ID
export const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).render('error-autorizacion', { mensaje: err.message });
    }

    // Verificar si el usuario es administrador
    if (usuario.rol === 'administrador') {
      const cantidadAdmins = await Usuario.countDocuments({ rol: 'administrador' });

      // Si hay solo un administrador, impedir eliminación
      if (cantidadAdmins <= 1) {
        return res.status(400).render('error-autorizacion', { mensaje: 'No se puede eliminar al único administrador del sistema.' });
      }
    }

    await Usuario.findByIdAndDelete(req.params.id);
    res.redirect('/usuarios');
  } catch (err) {
    res.status(500).render('error-autorizacion', { mensaje: err.message });
  }
};

// Mostrar formulario de edición de contraseña de usuario
export const mostrarFormularioEditarUsuario = async (req, res) => {
  try {
    const usuarios = await Usuario.findById(req.params.id);
    if (!usuarios) {
      return res.status(404).render('error-autorizacion', { mensaje: err.message });
    }
    res.render('editar_password', { usuarios });
  } catch (err) {
    res.status(500).render('error-autorizacion', { mensaje: err.message });
  }
};
