import mongoose from 'mongoose';

const mascotaSchema = new mongoose.Schema({
  nombre: String,
  especie: String,
  raza: String,
  anioNacimiento: Number,
  responsable: String
});

export default mongoose.model('Mascota', mascotaSchema);
