import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
// server.js
import cors from "cors";

// Routes
import chatRoutes from "./routes/chat.js";
import predictRoutes from "./routes/predict.js";
import reminderRoutes from "./routes/reminder.js";
import uploadRoutes from "./routes/upload.js";

// Models
import User from "./models/User.js";

// Load env variables
dotenv.config({ path: path.resolve("./.env"), quiet: true });

const app = express();
app.use(express.json());
app.use(cors());

// Ensure uploads directory exists
const UPLOADS_DIR = path.resolve("./uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully!");

    // Insert a test user if not exists
    const existingUser = await User.findOne({ email: "bhargav@example.com" });
    if (!existingUser) {
      const testUser = new User({ name: "Bhargav", email: "bhargav@example.com" });
      await testUser.save();
      console.log("✅ Test user inserted into users collection!");
    }
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/reminder", reminderRoutes);
app.use("/api/upload", uploadRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running and connected to MongoDB!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
