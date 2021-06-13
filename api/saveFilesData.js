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

  // id should be parsed and validated for security reasons
  if (id) {
    filesDataModel.updateOne({ _id: id }, body).exec((err) => {
      if (err) return res.json({ err });

      return res.json({ id, msg: 'Successfully updated your data' });
    });

    return;
  }

  // New Data

  const filesData = new filesDataModel(body);

  filesData.save((err, { _id }) => {
    if (err) return res.json({ err });

    return res.json({ id: _id, msg: 'Successfully saved your data' });
  });
};
