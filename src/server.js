
import mongoose from 'mongoose';
import process from 'process';
import app from './app.js';

const dbUrl = process.env.MONGO_URI;

mongoose.connect(dbUrl)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log('MongoDB connection error:', err);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


