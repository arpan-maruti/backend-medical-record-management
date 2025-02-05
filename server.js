// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import process from 'process';
import UserRoutes from './routes/userRoutes.js'
const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbUrl = process.env.MONGO_URI;




// Connect to MongoDB using Mongoose
mongoose.connect(dbUrl)
.then(() => {
    console.log('Connected to MongoDB');
})
  .catch((err) => {
    console.log('MongoDB connection error:', err);
});

app.use('/api', UserRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


