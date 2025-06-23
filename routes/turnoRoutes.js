import express from 'express';
import {
  crearTurno,
  obtenerTurnos,
  actualizarTurno,
  eliminarTurno,
  mostrarFormularioEditarTurno
} from '../controllers/turnoController.js';

const router = express.Router();

// Para vista PUG
router.get('/turnos', obtenerTurnos);
router.post('/turnos', crearTurno);
router.get('/turnos/:id/editar', mostrarFormularioEditarTurno);
router.post('/turnos/:id/editar', actualizarTurno); 
router.post('/turnos/:id/eliminar', eliminarTurno); 

// API JSON (opcional)
router.post('/api/turnos', crearTurno);
router.put('/api/turnos/:id', actualizarTurno);
router.delete('/api/turnos/:id', eliminarTurno);


export default router;
