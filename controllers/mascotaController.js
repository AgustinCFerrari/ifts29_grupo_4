// Importa el modelo "Mascota" desde la ruta especificada.
import Mascota from '../models/Mascota.js';

// Controlador para crear una nueva mascota
export const crearMascota = async (req, res) => {
  try {
    const nuevaMascota = new Mascota(req.body);
    await nuevaMascota.save();
    const mascotas = await Mascota.find();  // recuperar toda la lista
    res.render('mascotas', { mascotas });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Controlador para obtener todas las mascotas registradas
export const obtenerMascotas = async (req, res) => {
  try {
    // Recupera todas las mascotas de la base de datos
    const mascotas = await Mascota.find();
    // Devuelve la lista de mascotas
    res.render('mascotas', { mascotas });
  } catch (err) {
    // En caso de error, devuelve un código 500 (Error interno del servidor)
    res.status(500).json({ error: err.message });
  }
};

// Controlador para actualizar una mascota por su ID
export const actualizarMascota = async (req, res) => {
  try {
    // Actualiza la mascota
    await Mascota.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    // Vuelve a recuperar la lista completa actualizada
    const mascotas = await Mascota.find();
    // Renderiza la lista actualizada
    res.render('mascotas', { mascotas });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Controlador para eliminar una mascota por su ID
export const eliminarMascota = async (req, res) => {
  try {
    // Elimina una mascota con el ID proporcionado
    const resultado = await Mascota.deleteOne({ _id: req.params.id });
    // Devuelve el resultado de la operación
    res.json(resultado);
  } catch (err) {
    // Devuelve error si la eliminación falla
    res.status(400).json({ error: err.message });
  }
};

// =========================================
// Buscador de Mascotas por nombre o especie
// =========================================
export const buscarMascotas = async (req, res) => {
  try {
    const { nombre, especie } = req.query;

    // Busca en MongoDB usando filtros dinámicos
    const filtro = {};
    if (nombre) filtro.nombre = new RegExp(nombre, 'i'); // Insensible a mayúsculas
    if (especie) filtro.especie = new RegExp(especie, 'i');

    const mascotas = await Mascota.find(filtro);
    res.render('mascotas_busqueda', { mascotas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================
// Mostrar formulario de edición de una mascota
// ============================================
export const mostrarFormularioEditarMascota = async (req, res) => {
  try {
    const mascotas = await Mascota.findById(req.params.id);
    if (!mascotas) {
      return res.status(404).send('Mascota no encontrada');
    }
    res.render('editar_mascota', { mascotas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mostrar el formulario
export const mostrarFormularioHistoria = async (req, res) => {
  const mascota = await Mascota.findById(req.params.id);
  res.render('editar_historia_clinica', { mascota });
};

// Guardar cambios en historia clínica
export const guardarHistoriaClinica = async (req, res) => {
  const { veterinario, motivoConsulta, observaciones } = req.body;

  // Busca la mascota
  const mascota = await Mascota.findById(req.params.id);

  // Concatenar observaciones si ya existían
  const nuevasObservaciones = mascota.observaciones
    ? `${mascota.observaciones}\n${observaciones}`
    : observaciones;

  // Actualizar solo campos de historia clínica
  await Mascota.updateOne(
    { _id: req.params.id },
    {
      $set: {
        veterinario,
        motivoConsulta,
        observaciones: nuevasObservaciones
      }
    }
  );

  res.redirect('/mascotas');
};
