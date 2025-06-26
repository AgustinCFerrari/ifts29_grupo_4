// Importa el modelo "Producto" desde la ruta especificada.
import Producto from '../models/Producto.js';

// Controlador para crear una nuevo producto
export const crearProducto = async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    const productos = await Producto.find();  // recuperar toda la lista
    res.render('productos', { productos });
  } catch (err) {
    res.status(400).render('error-producto', { mensaje: err.message });
  }
};

// Controlador para obtener todos las productos registrados
export const obtenerProductos = async (req, res) => {
  try {
    // Recupera todos los productos de la base de datos
    const productos = await Producto.find();
    // Devuelve la lista de productos
    res.render('productos', { productos });
  } catch (err) {
    res.status(500).render('error-producto', { mensaje: err.message });
  }
};

// Controlador para actualizar un producto por su ID
export const actualizarProducto = async (req, res) => {
  try {
    // Actualiza el producto
    await Producto.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    // Vuelve a recuperar la lista completa actualizada
    const productos = await Producto.find();
    // Renderiza la lista actualizada
    res.render('productos', { productos });
  } catch (err) {
    res.status(400).render('error-producto', { mensaje: err.message });
  }
};

// Controlador para eliminar un producto por su ID
export const eliminarProducto = async (req, res) => {
  try {
    // Elimina un producto con el ID proporcionado
    const resultado = await Producto.deleteOne({ _id: req.params.id });
    // Devuelve el resultado de la operación
    res.redirect('/productos');
  } catch (err) {
    // Devuelve error si la eliminación falla
    res.status(400).render('error-producto', { mensaje: err.message });
  }
};

// Mostrar formulario de edición de un producto
export const mostrarFormularioEditarProducto = async (req, res) => {
  try {
    const productos = await Producto.findById(req.params.id);
    if (!productos) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('editar_producto', { productos });
  } catch (err) {
    res.status(500).render('error-producto', { mensaje: err.message });
  }
};
