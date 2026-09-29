const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Publicacion = sequelize.define('Publicacion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  autor_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  horas_estimadas: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0.01 },
  },
  habilidades: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  ciudad: {
    type: DataTypes.STRING,
    defaultValue: 'Cochabamba',
  },
  modalidad: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'presencial',
    validate: { isIn: [['presencial', 'remota', 'ambas']] },
  },
  activa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'publicaciones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Publicacion;
