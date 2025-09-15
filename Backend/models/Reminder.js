import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: Date, required: true },
});

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
