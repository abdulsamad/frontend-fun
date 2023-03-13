import { Handler } from '@netlify/functions';

import { connectToDatabase } from './db';
import filesDataModel from '../model/FilesData';

const handler: Handler = async (event) => {
	try {
		const id = event.queryStringParameters?.id;
		const body = event.body;

		if (event.httpMethod !== 'POST')
			return {
				statusCode: 400,
				body: JSON.stringify({ err: 'Only POST requests allowed.' }),
			};

		if (!body || !id)
			return {
				statusCode: 400,
				body: JSON.stringify({ err: 'No data found!' }),
			};

		// Connect to DB
		await connectToDatabase();

		// id should validated for security reasons
		if (id) {
			// Update Saved Data
			await filesDataModel.updateOne({ _id: id }, JSON.parse(body)).exec();

			return {
				statusCode: 201,
				body: JSON.stringify({
					id,
					msg: 'Successfully updated your data',
				}),
			};
		}

		// Create and Save New Data
		const filesData = new filesDataModel(body);
		const savedData = await filesData.save();

		return {
			statusCode: 201,
			body: JSON.stringify({
				id: savedData._id,
				msg: 'Successfully saved your data',
			}),
		};
	} catch (err) {
		return {
			statusCode: 500,
			body: JSON.stringify({ err: 'Internal server error' }),
		};
	}
};

export { handler };
