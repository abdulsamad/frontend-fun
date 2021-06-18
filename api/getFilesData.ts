import mongoose from 'mongoose';
import { VercelRequest, VercelResponse } from '@vercel/node';

import filesDataModel from '../model/FilesData';

mongoose.connect(process.env.DATABASE_URI as string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = (req: VercelRequest, res: VercelResponse) => {
  const { id } = req.query;

  if (req.method !== 'GET') return res.status(400).json({ err: 'Only GET requests allowed.' });

  // id should be and validated for security reasons
  filesDataModel
    .findOne({ _id: id })
    .exec()
    .then((data) => res.json(data))
    .catch((err) => res.json({ err }));
};
