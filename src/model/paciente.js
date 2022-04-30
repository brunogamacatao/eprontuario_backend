const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  nome: {type: String, required: true},
  cpf: {type: String},
  endereco: {type: String},
  dataDeNascimento: {type: Date},
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Paciente', pacienteSchema);