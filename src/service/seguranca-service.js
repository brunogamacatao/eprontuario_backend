const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../model/usuario');

const VALIDADE_TOKEN = 300; // 5 minutos (300 segundos)
const BCRYPT_SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);

const encripta = async (texto) => {
  return await bcrypt.hash(texto, BCRYPT_SALT_ROUNDS);
};

const compara = async (texto, textoEncriptado) => {
  return bcrypt.compare(texto, textoEncriptado);
};

const criaToken = (usuario) => {
  let payload = {
    id: usuario._id,
    email: usuario.email
  };

  let token = jwt.sign(payload, process.env.SECRET, {
    expiresIn: VALIDADE_TOKEN
  });

  return token;
};

const validaLogin = async (usuario, senha) => {
  if (!usuario) {
    throw 'Não foi encontrado um usuário com o email informado!';
  } else if (await compara(senha, usuario.senha)) {
    if (usuario.bloqueado) {
      throw 'Sua conta está bloqueada. Entre em contato com o administrador.';
    }
  } else {
    throw 'Senha inválida!';
  }
};

/* 
 * Função de middleware que deve ser chamada antes das requisições a backends
 * que só possam ser acessados por usuários autenticados.
 */
const isAutenticado = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) {
    return res.status(401).send({ 
      auth: false, 
      message: 'Não foi encontrado o token no cabeçalho da requisição.'
    });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }
  
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send({ 
        auth: false, 
        message: 'Token inválido.' 
      });
    }
    
    Usuario.findById(decoded.id, (err, usuario) => {
      req.session = usuario;
      next();
    });
  });
};

/* 
 * Função de middleware que deve ser chamada antes das requisições a backends
 * que só possam ser acessados por usuários autenticados com determinadas roles.
 */
const podeAcessar = (roles) => {
  return (req, res, next) => {
    let pode = false;

    roles.forEach((role) => {
      if (req.session.role === role) {
        pode = true;
      }
    });

    if (pode) {
      next();
    } else {
      res.status(403).send({auth: false, message: 'Você não tem autorização para acessar esse recurso'});
    }
  };
};

/* 
 * Função de middleware que deve ser chamada antes das requisições a backends
 * que só possam ser acessados por usuários autenticados com determinadas roles.
 */
const hasRole = (role) => {
  return (req, res, next) => {
    if (req.session.role === role) {
      next();
    } else {
      return res.status(401).send({ 
        auth: false, 
        message: 'Você não tem autorização para acessar esse recurso'
      });
    }
  };
};

module.exports = {
  encripta,
  compara,
  criaToken,
  isAutenticado,
  validaLogin,
  hasRole,
  podeAcessar
};