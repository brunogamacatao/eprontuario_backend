const mongoose = require('mongoose');

const conecta = (onConecta) => {
  mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
  const db = mongoose.connection;
  db.on('error', (error) => console.error(error));
  db.once('open', () => {
    onConecta && onConecta();
  });
};

module.exports = {
  conecta
};
