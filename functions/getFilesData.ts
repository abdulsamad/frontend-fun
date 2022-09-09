import { Handler } from "@netlify/functions";

import { connectToDatabase } from "./db";
import filesDataModel from "../model/FilesData";

const handler: Handler = async (event) => {
  const id = (event.queryStringParameters as any).id;

  if (event.httpMethod !== "GET") return { err: "Only GET requests allowed." };

  // Connect to DB
  connectToDatabase();

  // id should be and validated for security reasons
  try {
    const savedData = await filesDataModel.findOne({ _id: id }).exec();
    return savedData;
  } catch (err) {
    return { err };
  }
};

export { handler };
