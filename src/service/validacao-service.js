const TEMPO_TOKEN = parseInt(process.env.TEMPO_TOKEN_VALIDACAO_EXPIRA);

const validaTokenCadastro = (usuario, token) => {
  if (usuario.token_validacao === token) {
    if (usuario.data_geracao_token + TEMPO_TOKEN > Date.now()) {
      throw 'O token de expirou. Uma nova mensagem foi enviada para seu email.';
    }
  } else {
    throw 'Token inválido.';
  }
};

module.exports = {
  validaTokenCadastro
};