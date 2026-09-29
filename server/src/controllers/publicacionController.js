const { Op } = require('sequelize');
const { Usuario, Publicacion } = require('../models');

const MODALIDADES_VALIDAS = ['presencial', 'remota', 'ambas'];

exports.crear = async (req, res) => {
  try {
    const autorId = req.usuario?.id;
    if (!autorId) {
      return res.status(401).json({ mensaje: 'No autenticado.' });
    }

    const { titulo, descripcion, horas_estimadas, habilidades, ciudad, modalidad } = req.body;

    if (!titulo || !String(titulo).trim()) {
      return res.status(400).json({ mensaje: 'El título es obligatorio.' });
    }

    const horasNum = Number(horas_estimadas);
    if (!Number.isFinite(horasNum) || horasNum <= 0) {
      return res.status(400).json({ mensaje: 'Las horas estimadas deben ser un número mayor que cero.' });
    }

    if (modalidad && !MODALIDADES_VALIDAS.includes(modalidad)) {
      return res.status(400).json({ mensaje: 'Modalidad inválida. Usa presencial, remota o ambas.' });
    }

    const publicacion = await Publicacion.create({
      autor_id: autorId,
      titulo: String(titulo).trim(),
      descripcion: descripcion ? String(descripcion).trim() : null,
      horas_estimadas: horasNum,
      habilidades: Array.isArray(habilidades) ? habilidades : [],
      ciudad: ciudad ? String(ciudad).trim() : 'Cochabamba',
      modalidad: modalidad || 'presencial',
    });

    res.status(201).json(publicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la publicación.' });
  }
};

exports.listar = async (req, res) => {
  try {
    const { habilidad, ciudad, texto } = req.query;
    const where = { activa: true };

    if (habilidad) {
      where.habilidades = { [Op.contains]: [habilidad] };
    }
    if (ciudad) {
      where.ciudad = { [Op.iLike]: ciudad };
    }
    if (texto) {
      where.titulo = { [Op.iLike]: `%${texto}%` };
    }

    const publicaciones = await Publicacion.findAll({
      where,
      include: [
        { model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'apellido', 'ciudad'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(publicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al listar publicaciones.' });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const publicacion = await Publicacion.findByPk(id, {
      include: [
        { model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'apellido', 'ciudad'] },
      ],
    });
    if (!publicacion) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada.' });
    }
    res.json(publicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la publicación.' });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;

    const publicacion = await Publicacion.findByPk(id);
    if (!publicacion) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada.' });
    }
    if (String(publicacion.autor_id) !== String(usuarioId)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta publicación.' });
    }

    const { titulo, descripcion, horas_estimadas, habilidades, ciudad, modalidad, activa } = req.body;

    if (titulo !== undefined) {
      if (!String(titulo).trim()) {
        return res.status(400).json({ mensaje: 'El título no puede estar vacío.' });
      }
      publicacion.titulo = String(titulo).trim();
    }
    if (descripcion !== undefined) publicacion.descripcion = descripcion ? String(descripcion).trim() : null;
    if (horas_estimadas !== undefined) {
      const horasNum = Number(horas_estimadas);
      if (!Number.isFinite(horasNum) || horasNum <= 0) {
        return res.status(400).json({ mensaje: 'Las horas estimadas deben ser un número mayor que cero.' });
      }
      publicacion.horas_estimadas = horasNum;
    }
    if (habilidades !== undefined) publicacion.habilidades = Array.isArray(habilidades) ? habilidades : [];
    if (ciudad !== undefined) publicacion.ciudad = String(ciudad).trim();
    if (modalidad !== undefined) {
      if (!MODALIDADES_VALIDAS.includes(modalidad)) {
        return res.status(400).json({ mensaje: 'Modalidad inválida. Usa presencial, remota o ambas.' });
      }
      publicacion.modalidad = modalidad;
    }
    if (activa !== undefined) publicacion.activa = Boolean(activa);

    await publicacion.save();
    res.json(publicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar la publicación.' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;

    const publicacion = await Publicacion.findByPk(id);
    if (!publicacion) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada.' });
    }
    if (String(publicacion.autor_id) !== String(usuarioId)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta publicación.' });
    }

    await publicacion.destroy();
    res.json({ mensaje: 'Publicación eliminada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la publicación.' });
  }
};
