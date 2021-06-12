const mongoose = require('mongoose');
const filesDataModel = require('../model/FilesData');

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.json({ err: 'Only GET requests allowed.' });

  const { id } = req.query;

  // _id should be parsed and validated for security reasons
  filesDataModel.findOne({ id }).exec((err, data) => {
    if (err) return res.json({ err });

    return res.json(data);
  });
};
