const { checkHandsRanking } = require("./handsCheckers");
const { randomDigitGenerator3 } = require("./randomNumberGenerators");

const highCardsGenerator = (deck) => {
    // while(cardsRanking != 0){
    const genResultCards = [];

    for (let i = 0; i < 3; i++) {
      const randomNum = randomDigitGenerator3();
      const drawcards = deck[randomNum];
      genResultCards.push(drawcards);
    }
    console.log("deck", deck.length, genResultCards);
  
    const genCardsRanking = checkHandsRanking(genResultCards);
    return {genCardsRanking,genResultCards};
    // }
  };

  module.exports={highCardsGenerator}