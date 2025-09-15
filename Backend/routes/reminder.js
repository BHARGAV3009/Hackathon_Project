import express from "express";
import Reminder from "../models/Reminder.js";
const router = express.Router();

// Add reminder
router.post("/", async (req, res) => {
  const { userId, text, time } = req.body;
  const newReminder = new Reminder({ userId, text, time });
  await newReminder.save();
  res.json({ message: "Reminder added" });
});

// Get reminders for user
router.get("/:userId", async (req, res) => {
  const reminders = await Reminder.find({ userId: req.params.userId });
  res.json(reminders);
});

export default router;
