import express from 'express';
import {
  crearUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  mostrarFormularioEditarUsuario
} from '../controllers/usuarioController.js';

import { autorizar } from '../middlewares/autorizar.js';

const router = express.Router();

// Para vista PUG
router.get('/usuarios', autorizar(['administrador']), obtenerUsuarios);
router.post('/usuarios', autorizar(['administrador']), crearUsuario);
router.get('/usuarios/:id/editar', autorizar(['administrador']), mostrarFormularioEditarUsuario);
router.post('/usuarios/:id/editar', autorizar(['administrador']), actualizarUsuario); 
router.post('/usuarios/:id/eliminar', autorizar(['administrador']), eliminarUsuario); 

export default router;
