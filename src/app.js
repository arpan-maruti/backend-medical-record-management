
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
import logger from "./utils/logger.js";
import morgan from "morgan";

const morganFormat = ":method :url :status :res[content-length] :response-time ms";
const app = express();


const allowedOrigins = [
    process.env.CORS_ORIGIN_1,  // Example: 'https://frontend-app.onrender.com'
    process.env.CORS_ORIGIN_2   // Example: 'http://localhost:4200'
];

const corsOptions = {
    origin: process.env.CORS_ORIGIN_2, // Your frontend URL
    credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));
app.use(passport.initialize());
app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            content_length: message.split(" ")[3],
            responseTime: message.split(" ")[4],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
  );

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