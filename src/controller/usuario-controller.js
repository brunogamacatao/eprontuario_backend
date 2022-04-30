const express = require('express');
const router = express.Router();
const Usuario = require('../model/usuario');
const Seguranca = require('../service/seguranca-service');
const ValidacaoService = require('../service/validacao-service');

router.get('/', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), async (req, res) => {
  res.json(await Usuario.find());
});

router.get('/bloqueia/:id', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), async (req, res) => {
  await Usuario.findByIdAndUpdate(req.params.id, {bloqueado: true});
  res.json({mensagem: 'Usuário bloqueado com sucesso'});
});

router.get('/desbloqueia/:id', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), async (req, res) => {
  await Usuario.findByIdAndUpdate(req.params.id, {bloqueado: false});
  res.json({mensagem: 'Usuário desbloqueado com sucesso'});
});

router.get('/validar/:id/:token', findPorId, async (req, res) => {
  try {
    ValidacaoService.validaTokenCadastro(req.usuario, req.params.token);

    req.usuario.validado = true;
    req.usuario.save();

    res.status(200).json({
      message: 'Usuário validado com sucesso.'
    });
  } catch (erro) {
    res.status(404).json({ 
      message: 'O token de expirou. Uma nova mensagem foi enviada para seu email.'
    });
  }
});

router.get('/:id', Seguranca.isAutenticado, findPorId, async (req, res) => {
  res.json(req.usuario);
});

router.post('/', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), async (req, res) => {
  const dados = req.body;
  dados.senha = await Seguranca.encripta(dados.senha);

  try {
    const novo = await new Usuario(dados).save();
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.delete('/:id', Seguranca.isAutenticado, Seguranca.hasRole('administrador'), findPorId, async (req, res) => {
  await req.usuario.remove();
  res.status(200).json({
    message: 'Usuário removido com sucesso.'
  });

});

router.put('/:id', Seguranca.isAutenticado, findPorId, async (req, res) => {
  /*
   * Apenas administradores ou o próprio usuário pode mudar seus dados.
   */
  if (req.session.role === 'administrador' || req.session._id === req.params.id) {
    let usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      message: 'Usuário alterado com sucesso.',
      usuario, usuario
    });
  } else {
    res.status(403).send({auth: false, message: 'Você não tem autorização para alterar esse usuario'});
  }
});

// função de middleware para recuperar um usuario pelo id
async function findPorId(req, res, next) {
  try {
    req.usuario = await Usuario.findById(req.params.id);
    
    if (req.usuario === null) {
      return res.status(404).json({ 
        message: 'Nao foi possivel encontrar um usuário com o id informado'
      });
    }
  } catch(err) {
    return res.status(500).json({ message: err.message });
  }

  next();
};

module.exports = router;