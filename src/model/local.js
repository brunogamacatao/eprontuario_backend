const mongoose = require('mongoose');
const URLSlug = require('mongoose-slug-generator');

mongoose.plugin(URLSlug);

const localSchema = new mongoose.Schema({
  nome: {type: String, required: true},
  cabecalho: {type: String, required: true},
  rodape: {type: String, required: true},
  slug: { type: String, slug: 'nome'}
}, { 
  timestamps: true 
});

localSchema.pre('save', function(next) {
  this.slug = this.nome.split(' ').join('-');
  next();
});


module.exports = mongoose.model('Local', localSchema);