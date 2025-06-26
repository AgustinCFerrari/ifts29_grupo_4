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
    res.status(400).render('error-mascota', { mensaje: err.message });
  }
};

// Controlador para obtener todas las mascotas registradas
export const obtenerMascotas = async (req, res) => {
  try {
    const mascotas = await Mascota.find();
    res.render('mascotas', { mascotas });
  } catch (err) {
    res.status(500).render('error-mascota', { mensaje: err.message });
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
    const mascotas = await Mascota.find();
    res.render('mascotas', { mascotas });
  } catch (err) {
    res.status(400).render('error-mascota', { mensaje: err.message });
  }
};

// Buscador de Mascotas por nombre o especie
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
    res.status(500).render('error-mascota', { mensaje: err.message });
  }
};

// Mostrar formulario de edición de una mascota
export const mostrarFormularioEditarMascota = async (req, res) => {
  try {
    const mascotas = await Mascota.findById(req.params.id);
    if (!mascotas) {
      return res.status(404).send('Mascota no encontrada');
    }
    res.render('editar_mascota', { mascotas });
  } catch (err) {
    res.status(500).render('error-mascota', { mensaje: err.message });
  }
};

// Mostrar el formulario
export const mostrarFormularioHistoria = async (req, res) => {
  const mascota = await Mascota.findById(req.params.id);
  res.render('editar_historia_clinica', { mascota });
};

// Guardar cambios en historia clínica
export const guardarHistoriaClinica = async (req, res) => {
  const { motivoConsulta, observaciones } = req.body;

  // Toma el nombre desde la sesión:
  const veterinario = req.session?.usuario?.username || 'veterinario';

  // Busca la mascota
  const mascota = await Mascota.findById(req.params.id);

  // Genera fecha actual
  const fecha = new Date().toLocaleDateString('es-AR');
  
  // Concatena veterinario anterior con el nuevo
  const nuevoVeterinario = mascota.veterinario
    ? `${mascota.veterinario}\n${veterinario}`
    : `${veterinario}`;

  // Concatena motivo de consultas anteriores
  const nuevosMotivosConsulta = mascota.motivoConsulta
    ? `${mascota.motivoConsulta}\n ${motivoConsulta}`
    : `${motivoConsulta}`;

  // Concatena observaciones anteriores con fecha  
  const nuevasObservaciones = mascota.observaciones
    ? `${mascota.observaciones}\n[${fecha}] ${observaciones}`
    : `[${fecha}] ${observaciones}`;

  await Mascota.updateOne(
    { _id: req.params.id },
    {
      $set: {
        veterinario: nuevoVeterinario,
        motivoConsulta: nuevosMotivosConsulta,
        observaciones: nuevasObservaciones
      }
    }
  );

  const mascotaActualizada = await Mascota.findById(req.params.id);
  
  res.render('editar_historia_clinica', { mascota: mascotaActualizada });
};
