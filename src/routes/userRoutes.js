// routes/userRouter.js
import express from "express";
import { 
  register, 
  login, 
  setPasswordController, 
  sendOTPController, 
  verifyOTPController, 
  getUsers, 
  getUserByIdController, 
  // updateUserController, 
  // deleteUserController 
} from "../controllers/userContoller.js";
import roleMiddleware from '../middlewares/roleMiddlewares.js';
import passport from 'passport';

const router = express.Router();

// Routes
router.get("/", getUsers);
router.get("/:id", getUserByIdController);
router.post("/register",passport.authenticate('jwt', { session: false }),roleMiddleware(['admin']) ,register);
router.post("/login", login);
router.post("/set-password", setPasswordController);
router.post("/send-otp", sendOTPController);
router.post("/verify-otp", verifyOTPController);
// router.patch("/:id", getAllUsers, updateUserController);
// router.patch("/delete/:id", getAllUsers, deleteUserController);

export default router;
