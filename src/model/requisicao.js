const mongoose = require('mongoose');
const { Schema } = mongoose;

const requisicaoSchema = new mongoose.Schema({
  texto: {type: String, required: true},
  atendimento: { type: Schema.Types.ObjectId, ref: 'Atendimento' },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Requisicao', requisicaoSchema);