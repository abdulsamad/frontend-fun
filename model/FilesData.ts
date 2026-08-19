import { Schema, model, models } from 'mongoose';
import { fileData } from '../src/context/types';

interface IfilesData {
  filesData: fileData[];
}

const filesDataSchema: Schema = new Schema({
  filesData: { type: [Schema.Types.Mixed], required: true },
});

export default models.filesData || model<IfilesData>('filesData', filesDataSchema);
