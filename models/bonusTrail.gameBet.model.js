const mongoose = require("mongoose");

const gameBetSchema = new mongoose.Schema(
  {

    userId:{ type: mongoose.Schema.Types.ObjectId, ref: "UserMaster",default:null },
    game_id: { type: mongoose.Schema.Types.ObjectId, ref: "BonusTrailGameCard",default:null },
    bonusTrailBet:{
      bet_type:{type:String,default:null},
      betCoins: { type: Number,default:0 },
    }
   
  },
  { versionKey: false },
  { timestamps: true }
);

const BonusTrailBet = mongoose.model("BonusTrailBet", gameBetSchema);

module.exports = { BonusTrailBet };
