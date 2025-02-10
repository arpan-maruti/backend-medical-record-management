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
const app = express();
app.use(cors());
app.use(bodyParser.json());

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
app.use('/loiType', LoiTypeRoutes);
app.use("/instruction-types", InstructionTypeRoutes);
app.use("/parameters", ParameterRoutes);
app.use('/case', CaseRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//67a46a3346059b44b08c614b


