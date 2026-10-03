import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["ai", "user"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const websiteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled Website", trim: true, maxlength: 120 },
    latestCode: { type: String, required: true },
    conversation: [messageSchema],
    deployed: { type: Boolean, default: false },
    deployUrl: { type: String },
    slug: { type: String, unique: true, sparse: true },
    indexable: { type: Boolean, default: true }, // owner can opt out of search engines
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

websiteSchema.index({ user: 1, updatedAt: -1 }); // dashboard list
websiteSchema.index({ deployed: 1, indexable: 1, updatedAt: -1 }); // sitemap

const Website = mongoose.model("Website", websiteSchema);
export default Website;