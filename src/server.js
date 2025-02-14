// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import process from 'process';
import UserRoutes from './routes/userRoutes.js'
import LoiTypeRoutes from './routes/loiTypeRoutes.js'
import InstructionTypeRoutes from './routes/instructionTypeRoutes.js';
import ParameterRoutes from './routes/parameterRoutes.js';
import CaseRoutes from './routes/caseRoutes.js';
import FileRoutes from './routes/fileRoutes.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const dbUrl = process.env.MONGO_URI;

// Connect to MongoDB using Mongoose
mongoose.connect(dbUrl+"medical")
.then(() => {
    console.log('Connected to MongoDB');
})
  .catch((err) => {
    console.log('MongoDB connection error:', err);
});

app.use('/user', UserRoutes);
app.use('/case', CaseRoutes);
app.use("/parameters", ParameterRoutes);
app.use('/file', FileRoutes);  
app.use("/instruction-types", InstructionTypeRoutes);
app.use('/loiType', LoiTypeRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});