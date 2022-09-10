import { Handler } from "@netlify/functions";

import { connectToDatabase } from "./db";
import filesDataModel from "../model/FilesData";

const handler: Handler = async (event) => {
  try {
    const id = (event.queryStringParameters as any).id;

    if (event.httpMethod !== "GET")
      return {
        statusCode: 400,
        body: JSON.stringify({ err: "Only GET requests allowed." }),
      };

    // Connect to DB
    connectToDatabase();

    // id should be and validated for security reasons
    const savedData = await filesDataModel.findOne({ _id: id }).exec();

    return {
      statusCode: 200,
      body: JSON.stringify(savedData),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ err: "Internal server error" }),
    };
  }
};

export { handler };
