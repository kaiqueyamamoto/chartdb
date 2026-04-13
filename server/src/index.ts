import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app';

const PORT = process.env.PORT ?? 3001;
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/chartdb';

async function connectDB(): Promise<void> {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
}

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(
                `API docs available at http://localhost:${PORT}/api/docs`
            );
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });
