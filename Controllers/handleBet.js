const { BONUSTRAIL, winStatusObj } = require("../Constants/constant");
const { BonusTrailBet } = require("../models/bonusTrail.gameBet.model");
const { UserMaster } = require("../models/bonusTrail.gameUser.model");
const { BonusTrailGameCard } = require("../models/bonusTrail.maingame");

const handlebet = (userId, socket) => {
  socket.on("bet", async (data) => {
    const { coins, cardId } = data;
    try {
      const user = await UserMaster.findOne({ _id: userId });
      if (!user) {
        console.log({ msg: "user not found" });
        return;
      }
      if (user.coins <= 0 || coins <= 0 || user.coins - coins < 0) {
        socket.emit("noBet", { msg: "Insufficient Balance" });
        return;
      }
      if (!cardId) {
        console.log({ msg: "cardId required" });
        return;
      }

      const gameCard = await BonusTrailGameCard.findById(cardId);
      if (!gameCard) {
        console.log({ msg: "maincard not found" });
        return;
      }
      let userbet = await BonusTrailBet.findOne({ userId });
      if (!userbet) {
        userbet = new BonusTrailBet({
          userId: userId,
          game_id: gameCard._id,
        });
      }

      userbet.bonusTrailBet.bet_type = BONUSTRAIL;
      userbet.bonusTrailBet.betCoins += parseInt(coins);

      let updatedCoins = user.coins - parseInt(coins);
      user.coins = updatedCoins;

      // add main card id to user ref
      userbet.game_id = gameCard._id;

      gameCard.total += parseInt(coins);
      await gameCard.save();

      await user.save();
      await userbet.save();

      socket.emit("userDetails", { user });
    } catch (error) {
      console.log({ msg: "error in bet section", error: error });
    }
  });
};

const betWinHandler = async (gameId) => {
  try {
    const gameCard = await BonusTrailGameCard.findById(gameId);

    const users = await BonusTrailBet.find({
      game_id: gameId,
      "bonusTrailBet.bet_type": { $in: [BONUSTRAIL, null] },
    }).populate("userId");

    for (const user of users) {
      const updatedCoins = (
        user.userId.coins +
        user.bonusTrailBet.betCoins * 1.98
        ).toFixed(2);
        
        if (gameCard.winstatus == winStatusObj.YOU_WIN) {
        // Update the coins field in the user document
        await UserMaster.updateOne(
          { _id: user.userId._id },
          {
            $set: {
              coins: updatedCoins,
            },
          }
        );
        }
        user.bonusTrailBet.bet_type = null;
        user.bonusTrailBet.betCoins = 0;

        await user.save();
      }
   
  } catch (error) {
    console.log(error);
  }
};

module.exports = { handlebet, betWinHandler };
