# Proyecto Huellitas Felices

Este proyecto corresponde al sistema de gestión integral para la veterinaria "Huellitas Felices", desarrollado con Node.js, Express y MongoDB Atlas.

## Funcionalidades principales

- Gestión de Mascotas (CRUD)
- Gestión de Turnos (CRUD)
- Gestión de Productos (CRUD)
- Gestión de Usuarios (CRUD + Autenticación con bcrypt y manejo de sesiones)
- Historia clínica de mascotas con campos editables solo por veterinarios
- Búsqueda de mascotas
- Control de acceso según rol de usuario
- Renderizado de vistas con Pug
- Manejo de errores personalizados
- Despliegue en Render.com

## Usuarios predefinidos

| Usuario   | Contraseña | Rol          |
|-----------|------------|--------------|
| Claudia   | 12345      | administrador|
| Mariana   | 12345      | veterinario  |
| Facundo   | 12345      | empleado     |

## Librerías y tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- bcryptjs
- dotenv
- express-session
- Pug
- nodemon

## Configuración

1. Instalar dependencias:
```
npm install
```

2. Crear un archivo `.env` con la siguiente variable:
```
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/<baseDeDatos>?retryWrites=true&w=majority
```

3. Iniciar el servidor:
```
npm run dev
```

## Despliegue

El proyecto fue desplegado en Render.com y puede ser accedido desde la URL configurada en el servicio web.

## Enlaces importantes

- Sitio en Render: https://ifts29-grupo-4.onrender.com/

- Repositorio GitHub: https://github.com/AgustinCFerrari/ifts29_grupo_4

- Carpeta compartida en Google Drive: https://drive.google.com/drive/folders/1y1-kYj-0kDpP_1pyRDVHg9cO_ciyKl7d?usp=drive_link