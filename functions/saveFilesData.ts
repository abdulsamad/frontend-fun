import { Handler } from '@netlify/functions';
import mongoose from 'mongoose';

import { connectToDatabase } from './db';
import filesDataModel from '../model/FilesData';
import { fileData } from '../src/context/types';

const handler: Handler = async (event) => {
	try {
		const id = event.queryStringParameters?.id;
		const body = JSON.parse(event.body as any) as fileData[];

		if (event.httpMethod !== 'POST')
			return {
				statusCode: 400,
				body: JSON.stringify({ err: 'Only POST requests allowed.' }),
			};

		if (!body && !id)
			return {
				statusCode: 400,
				body: JSON.stringify({ err: 'No data found!' }),
			};

		// Connect to DB
		await connectToDatabase();

		// TODO: id should strictly validated for security reasons
		if (id) {
			if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id))
				throw new Error('Validation Error');

			// Update Saved Data
			await filesDataModel.updateOne({ _id: id }, body).exec();

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
		console.error(err);
		return {
			statusCode: 500,
			body: JSON.stringify({ err: 'Internal server error' }),
		};
	}
};

export { handler };
