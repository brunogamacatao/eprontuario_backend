const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Email = require('mongoose-type-email');

const usuarioSchema = new mongoose.Schema({
  email: {type: Email, required: true, unique: true},
  senha: {type: String, required: true},
  bloqueado: {type: Boolean, default: false},
  role: {
    type: String,
    enum : ['administrador', 'usuario', 'convidado'],
    default: 'usuario'
  }
}, { 
  timestamps: true 
});

usuarioSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Usuario', usuarioSchema);