export default class Producto {
  constructor(id, precio, stock, categoria) {
    this.id = id;
    this.precio = parseFloat(precio);
    this.stock = parseInt(stock);
    this.categoria = categoria;
  }
}
