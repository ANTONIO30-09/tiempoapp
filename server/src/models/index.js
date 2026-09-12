const sequelize = require('../config/sequelize');
const Usuario = require('./usuario');
const Transaccion = require('./transaccion');

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

const db = {
  sequelize,
  Usuario,
  Transaccion,
};

module.exports = db;
