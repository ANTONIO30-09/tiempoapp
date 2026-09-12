const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

exports.listar = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password_hash'] },
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al listar usuarios.' });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener usuario.' });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.usuario || req.usuario.id !== id) {
      return res.status(403).json({ mensaje: 'No autorizado para modificar este usuario.' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    const { nombre, apellido, email, password, habilidades, descripcion, avatar_url } = req.body;
    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (email) usuario.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      usuario.password_hash = await bcrypt.hash(password, salt);
    }
    if (habilidades !== undefined) usuario.habilidades = habilidades;
    if (descripcion !== undefined) usuario.descripcion = descripcion;
    if (avatar_url !== undefined) usuario.avatar_url = avatar_url;
    await usuario.save();
    const usuarioPublico = usuario.toJSON();
    delete usuarioPublico.password_hash;
    res.json(usuarioPublico);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ mensaje: 'El email ya está en uso.' });
    }
    res.status(500).json({ mensaje: 'Error al actualizar usuario.' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.usuario || req.usuario.id !== id) {
      return res.status(403).json({ mensaje: 'No autorizado para eliminar este usuario.' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario.' });
  }
};
