
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import '#config/passport.js';
import UserRoutes from '#routes/userRoutes.js';
import LoiTypeRoutes from '#routes/loiTypeRoutes.js';
import InstructionTypeRoutes from '#routes/instructionTypeRoutes.js';
import ParameterRoutes from '#routes/parameterRoutes.js';
import CaseRoutes from '#routes/caseRoutes.js';
import FileRoutes from '#routes/fileRoutes.js';

const app = express();



app.use(cors({
    origin: true, // Allow all origins
    credentials: true, // Allow cookies and authentication headers
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', // Added PATCH
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));
app.use(passport.initialize());

app.use('/user', UserRoutes);
app.use('/case', CaseRoutes);
app.use("/parameters", ParameterRoutes);
app.use('/file', FileRoutes);
app.use("/instruction-types", InstructionTypeRoutes);
app.use('/loiType', LoiTypeRoutes);

// Handle 404 errors
app.all("*", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

export default app;