import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    username: String,
    password: String,
    rol: String
});

export default mongoose.model('Usuario', usuarioSchema);
