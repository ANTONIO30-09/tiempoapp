const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

exports.registro = async (req, res) => {
  try {
    const { nombre, apellido, email, password, habilidades, descripcion, avatar_url } = req.body;
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(409).json({ mensaje: 'El email ya está registrado.' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password_hash,
      habilidades,
      descripcion,
      avatar_url,
      creditos_tiempo: 5.0,
    });
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
    res.status(201).json({ token, usuario: { id: usuario.id, nombre, apellido, email, ciudad: usuario.ciudad, habilidades, descripcion, avatar_url, creditos_tiempo: usuario.creditos_tiempo } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios.' });
    }
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }
    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, ciudad: usuario.ciudad, habilidades: usuario.habilidades, descripcion: usuario.descripcion, avatar_url: usuario.avatar_url, creditos_tiempo: usuario.creditos_tiempo } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
};
