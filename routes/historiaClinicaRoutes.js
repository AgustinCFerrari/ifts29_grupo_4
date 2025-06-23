import express from 'express';
import {
  crearHistoriaClinica,
  obtenerHistoriasClinicas,
  actualizarHistoriaClinica,
  eliminarHistoriaClinica
} from '../controllers/historiaClinicaController.js';

const router = express.Router();

// RUTA VISTA PUG -> HTML
router.get('/historias_clinicas', obtenerHistoriasClinicas);

// API JSON para crear, actualizar, eliminar
router.post('/api/historiasClinicas', crearHistoriaClinica);
router.put('/api/historiasClinicas/:id', actualizarHistoriaClinica);
router.delete('/api/historiasClinicas/:id', eliminarHistoriaClinica);

export default router;
