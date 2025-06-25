import express from 'express';
import {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto,
  mostrarFormularioEditarProducto
} from '../controllers/productoController.js';

import { autorizar } from '../middlewares/autorizar.js';

const router = express.Router();

// Para vista PUG
router.get('/productos', obtenerProductos);
router.post('/productos', crearProducto);
router.get('/productos/:id/editar', autorizar(['administrador']), mostrarFormularioEditarProducto);
router.post('/productos/:id/editar', autorizar(['administrador']), actualizarProducto); 
router.post('/productos/:id/eliminar', autorizar(['administrador']), eliminarProducto); 

export default router;
