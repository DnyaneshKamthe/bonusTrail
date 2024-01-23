const mongoose = require("mongoose");

const BonusTrailUserSchema = new mongoose.Schema(
  {
    userId: { type: Number },
    coins: { type: Number },
   
    baitCoins: { type: Number },
    game_id: { type: mongoose.Schema.Types.ObjectId, ref: "BonusTrailGameCard" },
  },
  { versionKey: false },
  { timestamps: true }
);

const BonusTrailgameuser = mongoose.model("BonusTrailgameuser", BonusTrailUserSchema);

module.exports = { BonusTrailgameuser };
