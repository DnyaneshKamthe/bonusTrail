const mongoose = require("mongoose");

const adminAmount = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { versionKey: false },
  { timestamps: true }
);

const BonusTrailAdminAmount = mongoose.model("BonusTrailAdminAmount",adminAmount);

module.exports = { BonusTrailAdminAmount };
