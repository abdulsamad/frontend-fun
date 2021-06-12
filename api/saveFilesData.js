const mongoose = require('mongoose');
const filesDataModel = require('../model/FilesData');

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = (req, res) => {
  const body = JSON.parse(req.body);
  const { id } = req.query;

  if (req.method !== 'POST') return res.json({ err: 'Only POST requests allowed.' });

  // _id should be parsed and validated for security reasons
  if (id) {
    filesDataModel.findOneAndUpdate({ id }, body).exec((err, { _id }) => {
      if (err) return res.json({ err });

      return res.json({ _id });
    });
  } else {
    const filesData = new filesDataModel(body);

    filesData.save((err, { _id }) => {
      if (err) return res.json({ err });

      return res.json({ _id });
    });
  }
};
