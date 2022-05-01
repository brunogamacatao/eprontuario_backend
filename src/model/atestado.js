const mongoose = require('mongoose');
const { Schema } = mongoose;

const atestadoSchema = new mongoose.Schema({
  texto: {type: String, required: true},
  atendimento: { type: Schema.Types.ObjectId, ref: 'Atendimento' },
  paciente: { type: Schema.Types.ObjectId, ref: 'Paciente' },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Atestado', atestadoSchema);