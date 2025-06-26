// Importa el modelo "Turno" desde la ruta especificada.
import Turno from '../models/Turno.js';

// Controlador para crear un nuevo turno
export const crearTurno = async (req, res) => {
  try {
    const turno = new Turno(req.body);
    await turno.save();
    res.redirect('/turnos');
  } catch (err) {
    res.status(400).render('error-turno', { mensaje: err.message });
  }
};

// Controlador para obtener todos los turnos registrados
export const obtenerTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find();
    res.render('turnos', { turnos });
  } catch (err) {
    res.status(500).render('error-turno', { mensaje: err.message });
  }
};

// Controlador para actualizar un turno por su ID
export const actualizarTurno = async (req, res) => {
  try {
    const turno = await Turno.updateOne(
      { _id: req.params.id },        // Filtro por ID
      { $set: req.body }             // Campos a actualizar
    );
    res.redirect('/turnos');
  } catch (err) {
    res.status(400).render('error-turno', { mensaje: err.message });
  }
};

// Controlador para eliminar un turno por su ID
export const eliminarTurno = async (req, res) => {
  try {
    const resultado = await Turno.deleteOne({ _id: req.params.id });
    res.redirect('/turnos');
  } catch (err) {
    res.status(400).render('error-turno', { mensaje: err.message });
  }
};

// Mostrar formulario de edición de un turno
export const mostrarFormularioEditarTurno = async (req, res) => {
  try {
    const turnos = await Turno.findById(req.params.id);
    if (!turnos) {
      return res.status(404).render('error-turno', { mensaje: err.message });
    }
    res.render('editar_turno', { turnos });
  } catch (err) {
    res.status(500).render('error-turno', { mensaje: err.message });
  }
};