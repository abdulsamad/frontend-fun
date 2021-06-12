const mongoose = require('mongoose');
const filesDataModel = require('../model/FilesData');

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = (req, res) => {
  const filesData = new filesDataModel(req.body);

  filesData.save((err, data) => {
    if (err) return res.json({ err });

    return res.json({ data });
  });
};
