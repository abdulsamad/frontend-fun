import { VercelRequest, VercelResponse } from '@vercel/node';

import { connectToDatabase } from './db';
import filesDataModel from '../model/FilesData';

module.exports = (req: VercelRequest, res: VercelResponse) => {
  const { id } = req.query;
  const body = req.body;

  if (req.method !== 'POST') return res.status(400).json({ err: 'Only POST requests allowed.' });

  // Connect to DB
  connectToDatabase();

  // id should validated for security reasons
  if (id) {
    // Update Saved Data
    filesDataModel
      .updateOne({ _id: id }, body)
      .exec()
      .then(() => res.json({ id, msg: 'Successfully updated your data' }))
      .catch((err) => res.status(500).json({ err }));
    return;
  }

  // Save New Data
  const filesData = new filesDataModel(body);

  filesData
    .save()
    .then(({ _id }) => res.json({ id: _id, msg: 'Successfully saved your data' }))
    .catch((err) => res.status(500).json({ err }));
};
