const express = require('express');
const router = express.Router();
const Local = require('../model/local');
const Atendimento = require('../model/atendimento');
const Prescricao = require('../model/prescricao');
const Requisicao = require('../model/requisicao');
const Atestado = require('../model/atestado');
const Seguranca = require('../service/seguranca-service');
const ObjectId = require('mongoose').Types.ObjectId; 

/*****************************************************************************
 * Rotas do local
 *****************************************************************************/
router.get('/', Seguranca.isAutenticado, async (req, res) => {
  res.json(await Local.find());
});

router.get('/:id', Seguranca.isAutenticado, findPorSlug, async (req, res) => {
  res.json(req.local);
});

router.post('/', Seguranca.isAutenticado, async (req, res) => {
  try {
    const novo = await new Local(req.body).save();
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.delete('/:id', Seguranca.isAutenticado, findPorSlug, async (req, res) => {
  await req.local.remove();
  res.status(200).json({
    message: 'Local removido com sucesso.'
  });

});

router.put('/:id', Seguranca.isAutenticado, findPorSlug, async (req, res) => {
  let local = await Local.findByIdAndUpdate(req.params.id, req.body);
  res.status(200).json({
    message: 'Local alterado com sucesso.',
    local, local
  });
});

// função de middleware para recuperar um local pelo id
async function findPorSlug(req, res, next) {
  try {
    req.local = await Local.findOne({slug: req.params.id});
    
    if (req.local === null) {
      return res.status(404).json({ 
        message: 'Nao foi possivel encontrar um local com o slug informado'
      });
    }
  } catch(err) {
    return res.status(500).json({ message: err.message });
  }

  next();
};

/*****************************************************************************
 * Rotas do atendimento
 *****************************************************************************/
router.get('/:id/atendimentos', Seguranca.isAutenticado, findPorSlug, async (req, res) => {
  res.json(await Atendimento.find({local_id: new ObjectId(req.local._id)}));
});

router.post('/:id/atendimentos', Seguranca.isAutenticado, findPorSlug, async (req, res) => {
  try {
    const novo = await new Atendimento({...req.body, local: req.local._id}).save();
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json(e);
  }
});

/*****************************************************************************
 * Rotas das prescrições
 *****************************************************************************/
router.get('/:id/atendimentos/:id_atendimento/prescricoes', Seguranca.isAutenticado, findPorSlug, findAtendimentoPorId, async (req, res) => {
  res.json(await Prescricao.find({atendimento_id: new ObjectId(req.atendimento._id)}));
});

router.post('/:id/atendimentos/:id_atendimento/prescricoes', Seguranca.isAutenticado, findPorSlug, findAtendimentoPorId, async (req, res) => {
  try {
    const nova = await new Prescricao({...req.body, atendimento: req.atendimento._id}).save();
    res.status(201).json(nova);
  } catch (e) {
    res.status(500).json(e);
  }
});

/*****************************************************************************
 * Rotas das requisicoes
 *****************************************************************************/
router.get('/:id/atendimentos/:id_atendimento/requisicoes', Seguranca.isAutenticado, findPorSlug, findAtendimentoPorId, async (req, res) => {
  res.json(await Requisicao.find({atendimento_id: new ObjectId(req.atendimento._id)}));
});

router.post('/:id/atendimentos/:id_atendimento/requisicoes', Seguranca.isAutenticado, findPorSlug, findAtendimentoPorId, async (req, res) => {
  try {
    const nova = await new Requisicao({...req.body, atendimento: req.atendimento._id}).save();
    res.status(201).json(nova);
  } catch (e) {
    res.status(500).json(e);
  }
});

/*****************************************************************************
 * Rotas dos atestados
 *****************************************************************************/
 router.get('/:id/atendimentos/:id_atendimento/atestados', Seguranca.isAutenticado, findPorSlug, findAtendimentoPorId, async (req, res) => {
  res.json(await Atestado.find({atendimento_id: new ObjectId(req.atendimento._id)}));
});

router.post('/:id/atendimentos/:id_atendimento/atestados', Seguranca.isAutenticado, findPorSlug, findAtendimentoPorId, async (req, res) => {
  try {
    const novo = await new Atestado({...req.body, atendimento: req.atendimento._id}).save();
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json(e);
  }
});

async function findAtendimentoPorId(req, res, next) {
  try {
    req.atendimento = await Atendimento.findById(req.params.id_atendimento);
    
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