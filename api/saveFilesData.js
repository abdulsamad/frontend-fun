const mongoose = require('mongoose');
const filesDataModel = require('../model/FilesData');

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.json({ err: 'Only POST requests allowed.' });

  const { _id } = req.query;

  // _id should be parsed and validated for security reasons
  if (_id) {
    filesDataModel.findOneAndUpdate({ _id }, req.body).exec((err, data) => {
      if (err) return res.json({ err });

      return res.json(data);
    });
  } else {
    const filesData = new filesDataModel(req.body);

    filesData.save((err, data) => {
      if (err) return res.json({ err });

      return res.json(data);
    });
  }
};
