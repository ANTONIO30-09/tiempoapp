const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Transaccion = sequelize.define('Transaccion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  emisor_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  receptor_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  horas: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0.01 },
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'transacciones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Transaccion;
