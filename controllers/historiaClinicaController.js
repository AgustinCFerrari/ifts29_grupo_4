// Importa el modelo "HistoriaClinica" desde la ruta especificada.
import HistoriaClinica from '../models/HistoriaClinica.js';

// Controlador para crear una nueva historia clínica
export const crearHistoriaClinica = async (req, res) => {
  try {
    // Crea una instancia de HistoriaClinica con los datos recibidos en el cuerpo de la solicitud
    const historiaClinica = new HistoriaClinica(req.body);
    // Guarda la nueva historia clínica en la base de datos
    await historiaClinica.save();
    // Devuelve la historia clínica creada con un código de estado 201 (Creado)
    res.status(201).json(historiaClinica);
  } catch (err) {
    // Si hay un error, responde con código 400 (Solicitud incorrecta) y el mensaje de error
    res.status(400).json({ error: err.message });
  }
};

// Controlador para obtener todas las historias clínicas registradas
export const obtenerHistoriasClinicas = async (req, res) => {
  try {
    // Recupera todas las historias clínicas de la base de datos
    const historiasClinicas = await HistoriaClinica.find();
    // Devuelve la lista de historias clínicas
    res.render('historias_clinicas', { historiasClinicas });
  } catch (err) {
    // En caso de error, devuelve un código 500 (Error interno del servidor)
    res.status(500).json({ error: err.message });
  }
};

// Controlador para actualizar una historia clínica por su ID
export const actualizarHistoriaClinica = async (req, res) => {
  try {
    // Busca una historia clínica por su ID y actualiza sus datos con los valores del cuerpo
    const historiaClinica = await HistoriaClinica.updateOne(
      { _id: req.params.id },        // Filtro por ID
      { $set: req.body }             // Campos a actualizar
    );
    // Devuelve el resultado de la operación de actualización
    res.json(historiaClinica);
  } catch (err) {
    // Si hay error, devuelve código 400 y el mensaje
    res.status(400).json({ error: err.message });
  }
};

/*// Controlador para actualizar múltiples historias clínicas con un filtro personalizado
export const actualizarVarias = async (req, res) => {
  try {
    // Actualiza varias historias clínicas según el filtro y los cambios indicados
    const resultado = await HistoriaClinica.updateMany(
      req.body.filtro,               // Filtro de selección
      { $set: req.body.cambios }     // Campos a modificar
    );
    // Devuelve el resultado de la operación
    res.json(resultado);
  } catch (err) {
    // Devuelve error si falla la operación
    res.status(400).json({ error: err.message });
  }
};*/

// Controlador para eliminar una historia clínica por su ID
export const eliminarHistoriaClinica = async (req, res) => {
  try {
    // Elimina una historia clínica con el ID proporcionado
    const resultado = await HistoriaClinica.deleteOne({ _id: req.params.id });
    // Devuelve el resultado de la operación
    res.json(resultado);
  } catch (err) {
    // Devuelve error si la eliminación falla
    res.status(400).json({ error: err.message });
  }
};

/*// Controlador para eliminar varias historias clínicas según un filtro
export const eliminarVarias = async (req, res) => {
  try {
    // Elimina todas las historias clínicas que coincidan con los criterios del cuerpo
    const resultado = await HistoriaClinica.deleteMany(req.body);
    // Devuelve el resultado de la operación
    res.json(resultado);
  } catch (err) {
    // Devuelve error si falla la operación
    res.status(400).json({ error: err.message });
  }
};*/