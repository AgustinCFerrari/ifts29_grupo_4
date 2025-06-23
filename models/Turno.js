import mongoose from 'mongoose';

const turnoSchema = new mongoose.Schema({
  servicio: String,
  fecha: String, 
  hora: String,  
  mascota: String, 
  duenio: String 
})

export default mongoose.model('Turno', turnoSchema);
