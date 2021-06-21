import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

let isConnected: any;

export const connectToDatabase = () => {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return Promise.resolve();
  }

  console.log('=> Using new database connection');
  return mongoose
    .connect(process.env.DATABASE_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((db) => {
      isConnected = db.connections[0].readyState;
    });
};
