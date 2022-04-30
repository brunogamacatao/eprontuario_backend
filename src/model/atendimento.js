const mongoose = require('mongoose');
const { Schema } = mongoose;

const atendimentoSchema = new mongoose.Schema({
  cid10: {type: String, required: true},
  textoCid10: {type: String, required: true},
  subjetivo: {type: String},
  objetivo: {type: String},
  avaliacao: {type: String},
  plano: {type: String},
  local: { type: Schema.Types.ObjectId, ref: 'Local' },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Atendimento', atendimentoSchema);