import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
    precio: Number,
    stock: Number,
    categoria: String
});

export default mongoose.model('Producto', productoSchema);
