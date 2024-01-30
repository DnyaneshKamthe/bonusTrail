const { BonusTrailGameCard } = require("../models/bonusTrail.maingame");
const { CardNameGenerator } = require("../utils/CardNameGenerator");
const { BonusTrailAdminAmount } = require("../models/bonusTrail.game.admin");
const { checkHandsRanking } = require("../utils/handsCheckers");
const {
  randomGameIdGenerator,
  randomDigitGenerator3,
} = require("../utils/randomNumberGenerators");
const { shuffle } = require("../utils/shuffle");
const { highCardsGenerator } = require("../utils/highCardsGenerator");
const { bonusTrailGameHistory } = require("../Constants/constant");
const { gameHistoryData } = require("../utils/gameHistoryData");

const cardID = { cardID: null };
let deck = [];
let flag = true;
var resultCards = [];
var cardsRanking = 5;

// const highCardsGenerator = (deck) => {
//   // while(cardsRanking != 0){
//   resultCards = [];
//   console.log("resultcards", resultCards);
//   for (let i = 0; i < 3; i++) {
//     const randomNum = randomDigitGenerator3();
//     const drawcards = deck[randomNum];
//     resultCards.push(drawcards);
//   }
//   console.log("deck", deck.length, resultCards);

//   cardsRanking = checkHandsRanking(resultCards);
//   return cardsRanking;
//   // }
// };

const MainGameIdGenerator = async () => {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  try {
    deck = [];

    for (const rank of ranks) {
      for (const suit of suits) {
        const card = { rank, suit };
        deck.push(card);
      }
    }
    //shuffle deck
    shuffle(deck);

    const GameId = randomGameIdGenerator();

    let mainGame = new BonusTrailGameCard({
      gameid: GameId,
      player1_amount: 0,
      player2_amount: 0,
      total: 0,
      player1Cards: [],
      player2Cards: [],
      winstatus: "",
    });
    let cardCreated = await mainGame.save();
    cardID.cardID = cardCreated._id;
  } catch (error) {
    console.log(error);
  }
};

// gameCardHandler

const gameCardHandler = async (gameCardId) => {
  flag = true;
  console.log("flag1", flag);

  try {
    if (deck.length > 0) {
      const mainGameCard = await BonusTrailGameCard.findById(gameCardId);

      if (!mainGameCard) {
        // socket.emit("gamecardError", { msg: "mainGame not Found" });
        console.log({ msg: "mainGame not found" });
      }
      resultCards = [];
      for (let i = 0; i < 3; i++) {
        const randomNum = randomDigitGenerator3();
        const drawcards = deck[randomNum];
        resultCards.push(drawcards);
      }
      console.log("deck", deck.length, resultCards);

      cardsRanking = checkHandsRanking(resultCards);

      let multiplyer = {
        0: 1,
        1: 2, //pair
        2: 4, //color
        3: 6, //sequence
        4: 20, // pure sequence
        5: 40, //trail
      };

      //admin Amount
      const adminAmount = await BonusTrailAdminAmount.find();
      console.log("amount", adminAmount[0].amount);

      while (flag == true) {
        if (
          adminAmount[0].amount <
            mainGameCard.total * multiplyer[cardsRanking] &&
          cardsRanking !== 0
        ) {
          const { genCardsRanking, genResultCards } = highCardsGenerator(deck);
          cardsRanking = genCardsRanking;
          resultCards = [...genResultCards];
          console.log("abeeeeeeeeeeeeeee baitada", genCardsRanking,genResultCards);
        } else if (
          adminAmount[0].amount >
          mainGameCard.total * multiplyer[cardsRanking]
        ) {
          let cardsName = GenerateCardsName(resultCards);
          mainGameCard.finalCards = cardsName;
          // finalCards
          if (cardsRanking > 0) {
            adminAmount[0].amount -= mainGameCard.total;
            mainGameCard.winstatus = "You Win";
          } else if (cardsRanking <= 0) {
            adminAmount[0].amount += mainGameCard.total;
            mainGameCard.winstatus = "You Loss";
          }
          flag = false;
          console.log("flag2", flag);
          break;
        } else {
          let cardsName = GenerateCardsName(resultCards);

          mainGameCard.finalCards = cardsName;
          // finalCards
          if (cardsRanking > 0) {
            adminAmount[0].amount -= mainGameCard.total;
            mainGameCard.winstatus = "You Win";
          } else if (cardsRanking <= 0) {
            adminAmount[0].amount += mainGameCard.total;
            mainGameCard.winstatus = "You Loss";
          }
    
          flag = false;
          console.log("flag3", flag);
          break;
        }
      }

      if (cardsRanking == 5) {
        mainGameCard.winnerSet = "Trail";
      } else if (cardsRanking == 4) {
        mainGameCard.winnerSet = "Pure Sequence";
      } else if (cardsRanking == 3) {
        mainGameCard.winnerSet = "Sequence";
      } else if (cardsRanking == 2) {
        mainGameCard.winnerSet = "Color";
      } else if (cardsRanking == 1) {
        mainGameCard.winnerSet = "Pair";
      } else if (cardsRanking == 0) {
        mainGameCard.winnerSet = "High Cards";
      }

      //game history logic
      let winValue = mainGameCard.winstatus == "You Win" ? "UW" : "UL";
      gameHistoryData(winValue, bonusTrailGameHistory);

      await mainGameCard.save();
      await adminAmount[0].save();
      console.log("maincard", mainGameCard);
      console.log("adminAmount-154", adminAmount);
      // })
    }
  } catch (error) {
    console.log({ msg: "error in gamehandlerfunction-", error: error });
  }
};

// const checkHandsRanking = (cards) => {
//   if (isTrail(cards)) {
//     return 5; // Trail
//   } else if (isPureSequence(cards)) {
//     return 4; // pure Sequence
//   } else if (isSequence(cards)) {
//     return 3; // Sequence
//   } else if (isColor(cards)) {
//     return 2; //color
//   } else if (isPair(cards)) {
//     return 1; // Pair
//   } else {
//     return 0; // High cards
//   }
// };

const GenerateCardsName = (cards) => {
  return cards.map((card) => CardNameGenerator(card));
};

module.exports = { MainGameIdGenerator, gameCardHandler, cardID };
