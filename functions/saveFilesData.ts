import { Handler } from "@netlify/functions";

import { connectToDatabase } from "./db";
import filesDataModel from "../model/FilesData";

const handler: Handler = async (event) => {
  const id = (event.queryStringParameters as any).id;
  const body = JSON.parse(event.body as any);

  if (event.httpMethod !== "POST")
    return { err: "Only POST requests allowed." };

  if (!body) return { err: "No data found!" };

  // Connect to DB
  await connectToDatabase();

  // id should validated for security reasons
  if (id) {
    // Update Saved Data
    return await filesDataModel
      .updateOne({ _id: id }, body)
      .exec()
      .then(() => ({ id, msg: "Successfully updated your data" }))
      .catch((err) => ({ err }));
  }

  // Save New Data
  const filesData = new filesDataModel(body);

  return await filesData
    .save()
    .then(({ _id }) => ({ id: _id, msg: "Successfully saved your data" }))
    .catch((err) => ({ err }));
};

export { handler };
