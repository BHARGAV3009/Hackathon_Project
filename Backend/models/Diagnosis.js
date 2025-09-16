import mongoose from "mongoose";

const diagnosisSchema = new mongoose.Schema(
  {
    // Linkage to authenticated Mongo user (preferred)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Optional linkage to client-only context (legacy)
    clientUserId: { type: String }, // id from localStorage (frontend)
    userEmail: { type: String },

    // Inputs
    vitals: { type: Object }, // { bp, sugar, age, weight } or any custom
    text: { type: String },
    imagePath: { type: String },
    imageMimeType: { type: String },

    // Output
    result: {
      diagnosis: { type: String },
      confidence: { type: Number },
      notes: { type: String },
      // allow arbitrary extra fields if model returns more
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model("Diagnosis", diagnosisSchema);