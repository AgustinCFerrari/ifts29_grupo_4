export default class Turno {
  constructor(id, servicio, fecha, hora, mascota, duenio) {
    this.id = id;
    this.servicio = servicio; // 'veterinaria' o 'peluquería'
    this.fecha = fecha; // formato 'YYYY-MM-DD'
    this.hora = hora;   // formato 'HH:MM'
    this.mascota = mascota; // nombre de la mascota
    this.duenio = duenio;     // nombre del responsable
  }
}
