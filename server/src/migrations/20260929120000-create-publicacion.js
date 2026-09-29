'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('publicaciones', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      autor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
      },
      horas_estimadas: {
        type: DataTypes.FLOAT,
        allowNull: false,
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
      },
      activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('publicaciones', ['autor_id']);
    await queryInterface.addIndex('publicaciones', ['ciudad']);
    await queryInterface.addIndex('publicaciones', ['activa']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('publicaciones');
  }
};
