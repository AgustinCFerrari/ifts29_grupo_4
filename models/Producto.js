import mongoose from 'mongoose';

const mascotaSchema = new mongoose.Schema({
    precio: Number,
    stock: Number,
    categoria: String
});

export default mongoose.model('Producto', mascotaSchema);
