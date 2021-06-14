const mongoose = require('mongoose');
const filesDataModel = require('../model/FilesData');

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = (req, res) => {
  const { id } = req.query;

  if (req.method !== 'GET') return res.json({ err: 'Only GET requests allowed.' });

  // id should be and validated for security reasons
  filesDataModel.findOne({ _id: id }).exec((err, data) => {
    if (err) return res.json({ err });

    return res.json(data);
  });
};
