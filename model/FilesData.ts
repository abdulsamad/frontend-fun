import { Schema, model } from 'mongoose';

interface IfilesData {
  filesData: [];
}

const filesDataSchema: Schema = new Schema({
  filesData: [],
});

export default model<IfilesData>('filesData', filesDataSchema);
