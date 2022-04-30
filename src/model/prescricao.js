const mongoose = require('mongoose');
const { Schema } = mongoose;

const prescricaoSchema = new mongoose.Schema({
  receita: {type: String, required: true},
  tipo: {type: String, required: true, enum: {
    values: ['COMUM', 'ESPECIAL'],
    message: '{VALUE} é um tipo inválido'
  }, default: 'COMUM'},
  atendimento: { type: Schema.Types.ObjectId, ref: 'Atendimento' },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Prescricao', prescricaoSchema);