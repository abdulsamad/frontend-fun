import { VercelRequest, VercelResponse } from '@vercel/node';

import { connectToDatabase } from './db';
import filesDataModel from '../model/FilesData';

module.exports = (req: VercelRequest, res: VercelResponse) => {
  const { id } = req.query;

  if (req.method !== 'GET') return res.status(400).json({ err: 'Only GET requests allowed.' });

  // Connect to DB
  connectToDatabase();

  // id should be and validated for security reasons
  filesDataModel
    .findOne({ _id: id })
    .exec()
    .then((data) => res.json(data))
    .catch((err) => res.json({ err }));
};
