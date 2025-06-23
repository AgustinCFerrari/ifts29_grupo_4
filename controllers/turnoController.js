// Importa el modelo "Turno" desde la ruta especificada.
import Turno from '../models/Turno.js';

// Controlador para crear un nuevo turno
export const crearTurno = async (req, res) => {
  try {
    // Crea una instancia de turno con los datos recibidos en el cuerpo de la solicitud
    const turno = new Turno(req.body);
    // Guarda la nuevo turno en la base de datos
    await turno.save();
    // Devuelve el turno creada con un código de estado 201 (Creado)
    res.redirect('/turnos');
  } catch (err) {
    // Si hay un error, responde con código 400 (Solicitud incorrecta) y el mensaje de error
    res.status(400).json({ error: err.message });
  }
};

// Controlador para obtener todos los turnos registrados
export const obtenerTurnos = async (req, res) => {
  try {
    // Recupera todas los turnos de la base de datos
    const turnos = await Turno.find();
    // Devuelve la lista de turnos
    res.render('turnos', { turnos });
  } catch (err) {
    // En caso de error, devuelve un código 500 (Error interno del servidor)
    res.status(500).json({ error: err.message });
  }
};

// Controlador para actualizar un turno por su ID
export const actualizarTurno = async (req, res) => {
  try {
    // Busca un turno por su ID y actualiza sus datos con los valores del cuerpo
    const turno = await Turno.updateOne(
      { _id: req.params.id },        // Filtro por ID
      { $set: req.body }             // Campos a actualizar
    );
    // Devuelve el resultado de la operación de actualización
    res.redirect('/turnos');
  } catch (err) {
    // Si hay error, devuelve código 400 y el mensaje
    res.status(400).json({ error: err.message });
  }
};

// Controlador para eliminar un turno por su ID
export const eliminarTurno = async (req, res) => {
  try {
    // Elimina un turno con el ID proporcionado
    const resultado = await Turno.deleteOne({ _id: req.params.id });
    // Devuelve el resultado de la operación
    res.redirect('/turnos');
  } catch (err) {
    // Devuelve error si la eliminación falla
    res.status(400).json({ error: err.message });
  }
};

// Mostrar formulario de edición de un turno
export const mostrarFormularioEditarTurno = async (req, res) => {
  try {
    const turnos = await Turno.findById(req.params.id);
    if (!turnos) {
      return res.status(404).send('Turno no encontrada');
    }
    res.render('editar_turno', { turnos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};