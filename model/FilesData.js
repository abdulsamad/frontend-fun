const mongoose = require('mongoose');

const filesDataSchema = new mongoose.Schema({
  filesData: [],
});

module.exports = mongoose.model('filesData', filesDataSchema);
