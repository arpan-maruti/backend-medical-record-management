import mongoose from 'mongoose';
import process from 'process';
import app from './app.js';

const dbUrl = process.env.MONGO_URI;
const startTime = new Date();
const poolOptions = {
  connectTimeoutMS: 30000,
  maxConnecting: 5,
  maxIdleTimeMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 5,
  waitQueueTimeoutMS: 5000
};
mongoose.connect(dbUrl, poolOptions)
.then(() => {
        console.log('Connected to MongoDB with pooling enabled');

    })
    .catch((err) => {
        console.log('MongoDB connection error:', err);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
