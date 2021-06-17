const mongoose = require('mongoose');
const filesDataModel = require('../model/FilesData');

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = (req, res) => {
  const { id } = req.query;
  const body = req.body;

  if (req.method !== 'POST') return res.json({ err: 'Only POST requests allowed.' });

  // id should validated for security reasons
  if (id) {
    filesDataModel.updateOne({ _id: id }, body).exec(err => {
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
