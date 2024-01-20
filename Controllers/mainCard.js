const { BonusTrailGameCard } = require("../models/bonusTrail.maingame");
const { CardNameGenerator } = require("../utils/CardNameGenerator");
const { BonusTrailAdminAmount } = require("../models/bonusTrail.game.admin")
const {
  isTrail,
  isPureSequence,
  isSequence,
  isColor,
  isPair,
} = require("../utils/handsCheckers");
const {
  randomNumberGenerator1,
  randomGameIdGenerator,
  randomNumberGenerator2,
  randomDigitGenerator3 
} = require("../utils/randomNumberGenerators");
const { shuffle } = require("../utils/shuffle");

const cardID = { cardID: null };
let deck = [];
let randomNumber;
var resultCards = []
const highCardsGenerator = (cardsRanking, deck) => {
  while(cardsRanking != 0){
    resultCards =  [];
    for (let i = 0; i < 3; i++) {
      const randomNum = randomDigitGenerator3();
      const drawcards = deck[randomNum];
      resultCards.push(drawcards);
    }
    console.log("deck", deck.length,resultCards);

    cardsRanking = checkHandsRanking(resultCards);
    return cardsRanking;
  }
}

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
  var cardsRanking = 5;
  try {
    if (deck.length > 0) {
     
      const mainGameCard = await BonusTrailGameCard.findById(gameCardId);

      if (!mainGameCard) {
        // socket.emit("gamecardError", { msg: "mainGame not Found" });
        console.log({ msg: "mainGame not found" });
      }
      for (let i = 0; i < 3; i++) {
        const randomNum = randomDigitGenerator3();
        const drawcards = deck[randomNum];
        resultCards.push(drawcards);
      }
      console.log("deck", deck.length,resultCards);

      cardsRanking = checkHandsRanking(resultCards);

      let multiplyer={
        1:10,
        2:20,
        3:30,
        4:40,
        5:50
      }
      const adminAmount = await BonusTrailAdminAmount.find();
      console.log(adminAmount.amount)

      // if(adminAmount<BaitAmount*multiplyer[5] && cardsRanking == 5){
      //   highCardsGenerator(cardsRanking,deck)

      // }
      // else if(adminAmount<BaitAmount*multiplyer[4] && cardsRanking == 4){
      //   highCardsGenerator(cardsRanking,deck)
      // }
      // else if(adminAmount<BaitAmount*multiplyer[3] && cardsRanking == 3){
      //   highCardsGenerator(cardsRanking,deck)
      // }
      // else if(adminAmount<BaitAmount*multiplyer[2] && cardsRanking == 2){
      //   highCardsGenerator(cardsRanking,deck)
      // }
      // else if(adminAmount<BaitAmount*multiplyer[1] && cardsRanking == 1){
      //   highCardsGenerator(cardsRanking,deck)
      // }else if((adminAmount>BaitAmount*multiplyer[5] && cardsRanking == 5) || (adminAmount>BaitAmount*multiplyer[4] && cardsRanking == 4) || (adminAmount<BaitAmount*multiplyer[3] && cardsRanking == 3) || (adminAmount<BaitAmount*multiplyer[2] && cardsRanking == 2) || (adminAmount<BaitAmount*multiplyer[1] && cardsRanking == 1) ){
      //   console.log("winner");
      // }else{
      //   highCardsGenerator(cardsRanking,deck)
      // }
      if (adminAmount < BaitAmount * multiplyer[cardsRanking]) {
        highCardsGenerator(cardsRanking, deck);
      } 
      
     
      
    
      // const side2cardsRanking = checkHandsRanking(side2Cards);
      // console.log("side1cardsRanking", side1cardsRanking);
      console.log("cardsRanking", cardsRanking);
      let cardNames = GenerateCardsName(resultCards);
      // let p2 = GenerateCardsName(side2Cards);
      console.log("cardNames", cardNames);
      // console.log("p2", p2);
      var ranking = 5;
     
      await mainGameCard.save();
      console.log("maincard", mainGameCard);
      // })
    }
  } catch (error) {
    console.log({ msg: "error in gamehandlerfunction-", error: error });
  }
};

const checkHandsRanking = (cards) => {
  if (isTrail(cards)) {
    return 5; // Trail
  } else if (isPureSequence(cards)) {
    return 4; // pure Sequence
  } else if (isSequence(cards)) {
    return 3; // Sequence
  } else if (isColor(cards)) {
    return 2; //color
  } else if (isPair(cards)) {
    return 1; // Pair
  } else {
    return 0; // High cards
  }
};

const GenerateCardsName = (cards) => {
  return cards.map((card) => CardNameGenerator(card));
};

module.exports = { MainGameIdGenerator, gameCardHandler, cardID };
