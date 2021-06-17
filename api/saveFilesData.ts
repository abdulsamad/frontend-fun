import mongoose from 'mongoose';
import { VercelRequest, VercelResponse } from '@vercel/node';

import filesDataModel from '../model/FilesData';

mongoose.connect(process.env.DATABASE_URI as string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = (req: VercelRequest, res: VercelResponse) => {
  const { id } = req.query;
  const body = req.body;

  if (req.method !== 'POST') return res.status(400).json({ err: 'Only POST requests allowed.' });

  // id should validated for security reasons
  if (id) {
    // Update Saved Data
    filesDataModel.updateOne({ _id: id }, body).exec((err) => {
      if (err) return res.status(500).json({ err });

      return res.json({ id, msg: 'Successfully updated your data' });
    });

    return;
  }

  // Save New Data
  const filesData = new filesDataModel(body);

  filesData.save((err, { _id }) => {
    if (err) return res.status(500).json({ err });

    return res.json({ id: _id, msg: 'Successfully saved your data' });
  });
};
