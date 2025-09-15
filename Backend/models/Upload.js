import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileUrl: String,
  description: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Upload", uploadSchema);
