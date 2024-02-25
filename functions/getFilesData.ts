import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';

import { connectToDatabase } from './db';
import filesDataModel from '../model/FilesData';

const handler: Handler = async (event) => {
	try {
		const id = event.queryStringParameters?.id;

		if (event.httpMethod !== 'GET')
			return {
				statusCode: 400,
				body: JSON.stringify({ err: 'Only GET requests allowed.' }),
			};

		if (!id)
			return {
				statusCode: 400,
				body: JSON.stringify({ err: 'ID is required to get the data' }),
			};

		if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id))
			return {
				statusCode: 400,
				body: JSON.stringify({ err: 'Validation Error' }),
			};

		// Connect to DB
		await connectToDatabase();

		// id should be and validated for security reasons
		const savedData = await filesDataModel.findOne({ _id: id }).exec();

		return {
			statusCode: 200,
			body: JSON.stringify(savedData),
		};
	} catch (err) {
		return {
			statusCode: 500,
			body: JSON.stringify({ err: 'Internal server error' }),
		};
	}
};

export { handler };
