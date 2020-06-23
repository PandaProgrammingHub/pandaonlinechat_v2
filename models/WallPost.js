const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WallPostSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Users" },
  pastDescription: {
    type: String,
    require: true,
  },
  cratedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WallPost", WallPostSchema);
