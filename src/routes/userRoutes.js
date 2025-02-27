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
  fetchCasesofUser
  // updateUserController,
  // deleteUserController
} from "#controllers/userContoller.js";
import { getAllCases } from "#controllers/caseController.js";
import roleMiddleware from "#middlewares/roleMiddlewares.js";
import passport from "passport";

const router = express.Router();
function getCases(req, res, next) {
  console.log(req.user+" " +req.user.role);
  if (req.user && req.user.userRole === "admin") {
    return getAllCases(req, res, next);
  } else {
    return fetchCasesofUser(req, res, next);
  }
}
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
  getCases
);
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["user", "admin"]),
  getUserByIdController
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
