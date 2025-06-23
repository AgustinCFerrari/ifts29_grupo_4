import mongoose from 'mongoose';

const historiaClinicaSchema = new mongoose.Schema({
  fecha: String,
  mascota: String,
  especie: String,
  raza: String,
  edad: Number,
  duenio: String,
  telefono: String,
  veterinario: String,
  motivoConsulta: String,
  observaciones: String
});

export default mongoose.model('HistoriaClinica', historiaClinicaSchema);
