const sequelize = require('../config/sequelize');
const Usuario = require('./usuario');

const db = {
  sequelize,
  Usuario,
};

module.exports = db;
