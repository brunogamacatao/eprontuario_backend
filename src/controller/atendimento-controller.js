const express = require('express');
const router = express.Router();
const Atendimento = require('../model/atendimento');
const Seguranca = require('../service/seguranca-service');

router.get('/', Seguranca.isAutenticado, async (req, res) => {
  res.json(await Atendimento.find().populate('local').populate('paciente'));
});

router.get('/:id', Seguranca.isAutenticado, findPorId, async (req, res) => {
  res.json(req.atendimento);
});

router.post('/', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), async (req, res) => {
  try {
    const novo = await new Atendimento(req.body).save();
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.delete('/:id', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), findPorId, async (req, res) => {
  await req.atendimento.remove();
  res.status(200).json({
    message: 'Atendimento removido com sucesso.'
  });

});

router.put('/:id', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), findPorId, async (req, res) => {
  let atendimento = await Atendimento.findByIdAndUpdate(req.params.id, req.body);
  res.status(200).json({
    message: 'Atendimento alterado com sucesso.',
    atendimento, atendimento
  });
});

// função de middleware para recuperar um atendimento pelo id
async function findPorId(req, res, next) {
  try {
    req.atendimento = await Atendimento.findById(req.params.id);
    
    if (req.atendimento === null) {
      return res.status(404).json({ 
        message: 'Nao foi possivel encontrar um atendimento com o id informado'
      });
    }
  } catch(err) {
    return res.status(500).json({ message: err.message });
  }

  next();
};

module.exports = router;