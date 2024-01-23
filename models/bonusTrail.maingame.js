const mongoose = require("mongoose");

const BonusTrailCardSchema = new mongoose.Schema(
  {
    gameid: { type: Number },
    total: { type: Number, default: 0 },
    finalCards: { type: Array },
    winstatus: { type: String },
    winnerSet : { type : String },
  },
  {
    versionKey: false,
    timestamps: true, // Use 'timestamps' instead of 'timeStamp'
  }
);

const BonusTrailGameCard = mongoose.model("BonusTrailGameCard", BonusTrailCardSchema);

module.exports = { BonusTrailGameCard };

