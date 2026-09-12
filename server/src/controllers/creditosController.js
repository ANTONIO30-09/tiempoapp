const { Op } = require('sequelize');
const { sequelize, Usuario, Transaccion } = require('../models');

exports.transferir = async (req, res) => {
  const emisorId = req.usuario?.id;
  const { receptor_id, horas, descripcion } = req.body;

  if (!emisorId) {
    return res.status(401).json({ mensaje: 'No autenticado.' });
  }
  if (!receptor_id) {
    return res.status(400).json({ mensaje: 'El receptor es obligatorio.' });
  }
  if (String(emisorId) === String(receptor_id)) {
    return res.status(400).json({ mensaje: 'No puedes transferirte horas a ti mismo.' });
  }

  const horasNum = Number(horas);
  if (!Number.isFinite(horasNum) || horasNum <= 0) {
    return res.status(400).json({ mensaje: 'Las horas deben ser un número mayor que cero.' });
  }

  try {
    const resultado = await sequelize.transaction(async (t) => {
      // Bloquear ambas filas en orden consistente para evitar deadlocks
      const [idMenor, idMayor] = [String(emisorId), String(receptor_id)].sort();

      const filaMenor = await Usuario.findByPk(idMenor, {
        lock: t.LOCK.UPDATE,
        transaction: t,
      });
      const filaMayor = await Usuario.findByPk(idMayor, {
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      const emisor = String(emisorId) === idMenor ? filaMenor : filaMayor;
      const receptor = String(receptor_id) === idMenor ? filaMenor : filaMayor;

      if (!emisor || !receptor) {
        const err = new Error('Usuario no encontrado.');
        err.status = 404;
        throw err;
      }

      const saldoActual = Number(emisor.creditos_tiempo);
      if (saldoActual < horasNum) {
        const err = new Error('Saldo insuficiente.');
        err.status = 400;
        throw err;
      }

      emisor.creditos_tiempo = saldoActual - horasNum;
      receptor.creditos_tiempo = Number(receptor.creditos_tiempo) + horasNum;

      await emisor.save({ transaction: t });
      await receptor.save({ transaction: t });

      const transaccion = await Transaccion.create({
        emisor_id: emisorId,
        receptor_id,
        horas: horasNum,
        descripcion: descripcion ? String(descripcion).trim() : null,
      }, { transaction: t });

      return { transaccion, nuevoSaldo: emisor.creditos_tiempo };
    });

    return res.status(201).json({
      transaccion: resultado.transaccion,
      saldo: resultado.nuevoSaldo,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ mensaje: error.message });
    }
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al procesar la transferencia.' });
  }
};

exports.historial = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return res.status(401).json({ mensaje: 'No autenticado.' });
    }

    const transacciones = await Transaccion.findAll({
      where: {
        [Op.or]: [
          { emisor_id: usuarioId },
          { receptor_id: usuarioId },
        ],
      },
      include: [
        { model: Usuario, as: 'emisor', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'receptor', attributes: ['id', 'nombre', 'apellido'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(transacciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener historial.' });
  }
};

exports.saldo = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return res.status(401).json({ mensaje: 'No autenticado.' });
    }

    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: ['id', 'creditos_tiempo'],
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.json({ creditos_tiempo: usuario.creditos_tiempo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener saldo.' });
  }
};
