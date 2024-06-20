import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import middlewares from './middlewares/index';
import router from './routes/index';
import { database , redisClient } from './services/index';

let app = express();

app = middlewares(app);

app.use(router);

app.listen(process.env.PORT || 3000, async () => {
	try {
		await database.connectDatabase();
		console.log(`🚀 Server is running on port ${process.env.PORT || 3000}`);
	} catch (error) {
		await gracefulShutdown();
	}
});

async function gracefulShutdown() {
	try {
		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
