import express from 'express';
import {
  crearMascota,
  obtenerMascotas,
  actualizarMascota,
  buscarMascotas,
  mostrarFormularioEditarMascota,
  mostrarFormularioHistoria,
  guardarHistoriaClinica     
} from '../controllers/mascotaController.js';

import { autorizar } from '../middlewares/autorizar.js';

const router = express.Router();

// RUTA VISTA PUG -> HTML
router.get('/mascotas', obtenerMascotas);
router.post('/mascotas', crearMascota);

// API JSON para crear, actualizar, eliminar
router.post('/api/mascotas', crearMascota);
router.put('/api/mascotas/:id', actualizarMascota);


// RUTA PARA BUSCAR MASCOTAS
router.get('/mascotas/buscar', buscarMascotas);
router.get('/formulario-busqueda', (req, res) => {
  res.render('formulario_busqueda_mascotas');
});

// RUTA PARA EDITAR MASCOTAS
router.get('/mascotas/:id/editar', mostrarFormularioEditarMascota);
router.post('/mascotas/:id/editar', actualizarMascota);

// RUTA PARA HISTORIA CLÍNICA
router.get('/mascotas/:id/editar-historia', autorizar(['veterinario']), mostrarFormularioHistoria);
router.post('/mascotas/:id/editar-historia', autorizar(['veterinario']), guardarHistoriaClinica);

export default router;
