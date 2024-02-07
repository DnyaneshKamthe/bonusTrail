const mongoose = require("mongoose");

const userMasterSchema = new mongoose.Schema(
  {

    coins: { type: Number },
    game_id: { type: mongoose.Schema.Types.ObjectId, ref: "BonusTrailGameCard" },
    bonusTrailBet:{
      bet_type:{type:String,default:null},
      betCoins: { type: Number,default:0 },
    }
   
  },
  { versionKey: false },
  { timestamps: true }
);

const UserMaster = mongoose.model("UserMaster", userMasterSchema);

module.exports = { UserMaster };
