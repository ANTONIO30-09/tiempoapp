const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ciudad: {
    type: DataTypes.STRING,
    defaultValue: 'Cochabamba',
  },
  habilidades: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  avatar_url: {
    type: DataTypes.STRING,
  },
  creditos_tiempo: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0,
  },
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Usuario;
