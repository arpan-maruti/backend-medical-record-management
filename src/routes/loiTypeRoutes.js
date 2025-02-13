import express from "express";
import User from "../models/user.js";
import LoiType from "../models/loiType.js";
const router = express.Router();

const validateParams = (req, res, next) => {
  const missingFields = [];
  if (!req.body.loiMsg) missingFields.push('loiMsg');
  if (!req.body.createdBy) missingFields.push('createdBy');
  if (!req.body.modifiedBy) missingFields.push('modifiedBy');
  if (missingFields.length > 0) {
    return res.status(400).json({
      code: "Bad Request",
      message: `The following fields are required: ${missingFields.join(', ')}`,
    });
  }
  next();
}

router.post("/", validateParams, async (req, res) => {
  const { loiMsg, createdBy, modifiedBy } = req.body;
  try {
    const createdByUser = await User.findOne({ createdBy: createdBy, isDeleted: false });
    const modifiedByUser = await User.findOne({ modifiedBy: modifiedBy, isDeleted: false });
    if (!createdByUser || !modifiedByUser) {
      return res.status(400).json({
        code: "Bad Request",
        message: "Invalid userId provided in createdBy or modifiedBy.",
      });
    }

    const newLoiType = new LoiType({
      loiMsg,
      createdBy,
      modifiedBy
    });

    await newLoiType.save();
    res.status(201).json({
      code: "Created",
      data: newLoiType,
    });
  } catch (err) {
    res.status(500).json({
      code: "Error",
      message: "An error occurred while adding the loi",
      error: err.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const loiTypes = await LoiType.find();
    res.status(200).json(loiTypes);
  } catch (err) {
    res.status(500).json({
      code: "Error",
      message: "An error occurred while adding the loi",
      error: err.message,
    });
  }
});

export default router;
