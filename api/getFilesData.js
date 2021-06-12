const mongoose = require('mongoose');
const filesDataModel = require('../model/FilesData');

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = (req, res) => {
  const { _id } = req.query;

  // _id should be parsed for security reasons
  filesDataModel.find({ _id }).exec((err, data) => {
    if (err) return res.json({ err });

    return res.json({ data });
  });
};
