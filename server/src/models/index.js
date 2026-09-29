const sequelize = require('../config/sequelize');
const Usuario = require('./usuario');
const Transaccion = require('./transaccion');
const Publicacion = require('./publicacion');

Usuario.hasMany(Transaccion, {
  as: 'transaccionesEnviadas',
  foreignKey: 'emisor_id',
});

Usuario.hasMany(Transaccion, {
  as: 'transaccionesRecibidas',
  foreignKey: 'receptor_id',
});

Transaccion.belongsTo(Usuario, {
  as: 'emisor',
  foreignKey: 'emisor_id',
});

Transaccion.belongsTo(Usuario, {
  as: 'receptor',
  foreignKey: 'receptor_id',
});

Usuario.hasMany(Publicacion, {
  as: 'publicaciones',
  foreignKey: 'autor_id',
});

Publicacion.belongsTo(Usuario, {
  as: 'autor',
  foreignKey: 'autor_id',
});

const db = {
  sequelize,
  Usuario,
  Transaccion,
  Publicacion,
};

module.exports = db;
