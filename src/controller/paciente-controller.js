const express = require('express');
const router = express.Router();
const Paciente = require('../model/paciente');
const Seguranca = require('../service/seguranca-service');

router.get('/', Seguranca.isAutenticado, async (req, res) => {
  res.json(await Paciente.find());
});

router.get('/:id', Seguranca.isAutenticado, findPorId, async (req, res) => {
  res.json(req.paciente);
});

router.post('/', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), async (req, res) => {
  try {
    const novo = await new Paciente(req.body).save();
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.delete('/:id', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), findPorId, async (req, res) => {
  await req.paciente.remove();
  res.status(200).json({
    message: 'Paciente removido com sucesso.'
  });

});

router.put('/:id', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), findPorId, async (req, res) => {
  let paciente = await Paciente.findByIdAndUpdate(req.params.id, req.body);
  res.status(200).json({
    message: 'Paciente alterado com sucesso.',
    paciente, paciente
  });
});

// função de middleware para recuperar um paciente pelo id
async function findPorId(req, res, next) {
  try {
    req.paciente = await Paciente.findById(req.params.id);
    
    if (req.paciente === null) {
      return res.status(404).json({ 
        message: 'Nao foi possivel encontrar um paciente com o id informado'
      });
    }
  } catch(err) {
    return res.status(500).json({ message: err.message });
  }

  next();
};

module.exports = router;