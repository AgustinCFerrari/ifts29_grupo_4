export default class Mascota {
  constructor(id, nombre, especie, raza, anioNacimiento, responsable) {
    this.id = id;
    this.nombre = nombre;
    this.especie = especie;
    this.raza = raza;
    this.anioNacimiento = parseInt(anioNacimiento);
    this.responsable = responsable;
  }
}
