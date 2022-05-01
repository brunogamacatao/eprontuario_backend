const express = require('express');
const router = express.Router();
const Local = require('../model/local');
const Paciente = require('../model/paciente');
const Atendimento = require('../model/atendimento');
const Prescricao = require('../model/prescricao');
const Requisicao = require('../model/requisicao');
const Atestado = require('../model/atestado');
const Seguranca = require('../service/seguranca-service');
const ObjectId = require('mongoose').Types.ObjectId; 

// TODO - todos os atendimentos devem ser para um local -> paciente

/**
 * Rotas desse controller:
 * + LOCAIS +
 * GET    / => retorna todos os locais
 * GET    /:id => retorna um local com o SLUG informado
 * POST   / => cadastra um local
 * DELETE /:id => remove um local pelo SLUG informado
 * PUT    /:id => atualiza um local pelo SLUG informado
 * + ATENDIMENTOS +
 * GET    /:id/pacientes/:id_paciente/atendimentos => retorna todos os atendimentos de um local
 * GET    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento => retorna um atendimento de um local
 * POST   /:id/pacientes/:id_paciente/atendimentos => cadastra um atendimento em um local
 * + PRESCRIÇÕES +
 * GET    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes => retorna as prescrições de um atendimento
 * POST   /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes => adiciona uma prescrição a um atendimento
 * GET    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes/:id_prescricao
 * PUT    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes/:id_prescricao
 * DELETE /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes/:id_prescricao
 * + ATESTADOS +
 * GET    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados => retorna todos os atestados de um atendimento
 * POST   /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados => cadastra um atestado em um atendimento
 * GET    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados/:id_atestado
 * PUT    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados/:id_atestado
 * DELETE /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados/:id_atestado
 * + REQUISIÇÕES +
 * GET    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes => retorna todas as requisições de um atendimento
 * POST   /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes => cadastra uma requisição em um atendimento
 * GET    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes/:id_requisicao
 * PUT    /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes/:id_requisicao
 * DELETE /:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes/:id_requisicao
 */

/*****************************************************************************
 * Rotas do local
 * ---------------------------------------------------------------------------
 * Fluxo de uso da aplicação:
 * 1. Faz login
 * 2. Seleciona um local
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
  let local = await Local.findByIdAndUpdate(req.local._id, req.body);
  res.status(200).json({
    message: 'Local alterado com sucesso.',
    local: local
  });
});

/*****************************************************************************
 * Rotas do atendimento
 * ---------------------------------------------------------------------------
 * Fluxo de uso da aplicação:
 * 1. Faz login
 * 2. Seleciona um paciente
 * 3. Inicia um atendimento
 *****************************************************************************/
router.get('/:id/pacientes/:id_paciente/atendimentos', Seguranca.isAutenticado, findPorSlug, findPacientePorId, async (req, res) => {
  res.json(await Atendimento.find({local_id: new ObjectId(req.local._id)}));
});

router.get('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  res.json(req.atendimento);
});

router.post('/:id/pacientes/:id_paciente/atendimentos', Seguranca.isAutenticado, findPorSlug, findPacientePorId, async (req, res) => {
  try {
    const novo = await new Atendimento({...req.body, local: req.local._id, paciente: req.paciente._id}).save();
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json(e);
  }
});

/*****************************************************************************
 * Rotas das prescrições
 * ---------------------------------------------------------------------------
 * Fluxo de uso da aplicação:
 * 1. Faz login
 * 2. Seleciona um paciente
 * 3. Inicia um atendimento
 * 4. Adiciona prescrições OU requisições OU atestados
 *****************************************************************************/
router.get('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  res.json(await Prescricao.find({atendimento_id: new ObjectId(req.atendimento._id)}));
});

router.get('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes/:id_prescricao', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  res.json(await Prescricao.findById(req.params.id_prescricao));
});

router.post('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  try {
    const nova = await new Prescricao({...req.body, atendimento: req.atendimento._id}).save();
    res.status(201).json(nova);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.put('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes/:id_prescricao', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  let obj = await Prescricao.findByIdAndUpdate(req.params.id_prescricao, req.body);
  res.status(200).json({
    message: 'Dados alterados com sucesso.',
    obj: obj
  });
});

router.delete('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/prescricoes/:id_prescricao', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  let obj = await Prescricao.findById(req.params.id_prescricao);
  await obj.remove();
  res.status(200).json({
    message: 'Registro removido com sucesso.'
  });
});

/*****************************************************************************
 * Rotas das requisicoes
 * ---------------------------------------------------------------------------
 * Fluxo de uso da aplicação:
 * 1. Faz login
 * 2. Seleciona um paciente
 * 3. Inicia um atendimento
 * 4. Adiciona prescrições OU requisições OU atestados
 *****************************************************************************/
router.get('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  res.json(await Requisicao.find({atendimento_id: new ObjectId(req.atendimento._id)}));
});

router.post('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  try {
    const nova = await new Requisicao({...req.body, atendimento: req.atendimento._id}).save();
    res.status(201).json(nova);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes/:id_requisicao', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  res.json(await Requisicao.findById(req.params.id_requisicao));
});

router.put('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes/:id_requisicao', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  let obj = await Requisicao.findByIdAndUpdate(req.params.id_requisicao, req.body);
  res.status(200).json({
    message: 'Dados alterados com sucesso.',
    obj: obj
  });
});

router.delete('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/requisicoes/:id_requisicao', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  let obj = await Requisicao.findById(req.params.id_requisicao);
  await obj.remove();
  res.status(200).json({
    message: 'Registro removido com sucesso.'
  });
});

/*****************************************************************************
 * Rotas dos atestados
 * ---------------------------------------------------------------------------
 * Fluxo de uso da aplicação:
 * 1. Faz login
 * 2. Seleciona um paciente
 * 3. Inicia um atendimento
 * 4. Adiciona prescrições OU requisições OU atestados
 *****************************************************************************/
 router.get('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  res.json(await Atestado.find({atendimento_id: new ObjectId(req.atendimento._id)}));
});

router.post('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  try {
    const novo = await new Atestado({...req.body, atendimento: req.atendimento._id, paciente: req.paciente._id}).save();
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados/:id_atestado', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  res.json(await Atestado.findById(req.params.id_atestado));
});

router.put('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados/:id_atestado', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  let obj = await Atestado.findByIdAndUpdate(req.params.id_atestado, req.body);
  res.status(200).json({
    message: 'Dados alterados com sucesso.',
    obj: obj
  });
});

router.delete('/:id/pacientes/:id_paciente/atendimentos/:id_atendimento/atestados/:id_atestado', Seguranca.isAutenticado, findPorSlug, findPacientePorId, findAtendimentoPorId, async (req, res) => {
  let obj = await Atestado.findById(req.params.id_atestado);
  await obj.remove();
  res.status(200).json({
    message: 'Registro removido com sucesso.'
  });
});

// Funções de middleware
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

async function findPacientePorId(req, res, next) {
  try {
    req.paciente = await Paciente.findById(req.params.id_paciente);
    
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