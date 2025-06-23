export function autorizar(rolesPermitidos) {
  return (req, res, next) => {
    // Verifica si el usuario tiene un rol y si está en la lista de roles permitidos
    if (!req.session?.usuario?.rol || !rolesPermitidos.includes(req.session.usuario.rol)) {
      return res.status(403).render('error-autorizacion', { mensaje: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
}
