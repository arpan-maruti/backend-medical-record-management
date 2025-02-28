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
  logout,
  fetchCasesofUser,
  updateUserController,
  // deleteUserController
} from "#controllers/userContoller.js";
import { getAllCases } from "#controllers/caseController.js";
import roleMiddleware from "#middlewares/roleMiddlewares.js";
import passport from "passport";
import multer from 'multer';
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/files/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
// Routes
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["admin"]),
  getUsers
);
// GET: Get all cases of user
router.get(
  "/cases",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["user", "admin"]),
  upload.single("file"),
  fetchCasesofUser
);
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["user", "admin"]),
  getUserByIdController
);
router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["admin"]),
  updateUserController
);
router.post(
  "/register",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["admin"]),
  register
);
router.post("/login", login);
router.post("/set-password", setPasswordController);
router.post("/send-otp", sendOTPController);
router.post("/verify-otp", verifyOTPController);
router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  logout
); // <-- New logout endpoint



// router.patch("/:id", getAllUsers, updateUserController);
// router.patch("/delete/:id", getAllUsers, deleteUserController);

export default router;
