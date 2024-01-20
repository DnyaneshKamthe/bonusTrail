const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");
const { BonusTrailGameCard } = require("./models/bonusTrail.maingame");
require("dotenv").config();
const { registerUser, updatedUserAfterWin } = require("./Controllers/users");
const {
  cardID,
  MainGameIdGenerator,
  gameCardHandler,
} = require("./Controllers/mainCard");
const { handleBait, baitWinHandler } = require("./Controllers/handleBait");
const { connection } = require("./config/db");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const io = socketIO(server);

// let value = 30;
app.get("/", (req, res) => {
  res.send("server is running");
});

let timerState = {
  duration: 30,
  isRunning: false,
  stateFlag: true,
  baitFlag:true
};

const sendMainCardData=async()=>{
  let main_card= await BonusTrailGameCard.findById(cardID.cardID);
  io.to("BonusTrailRoom").emit("Main_Card", {gameCard: main_card})
}
function starttimer(){
  if (!timerState.isRunning) {
    timerState.isRunning = true;
    timerInterval = setInterval(() => {
      timerState.duration--;
      console.log(timerState.duration);
  
      if (timerState.duration == 0 &&timerState.stateFlag == true ||timerState.duration <= 30 && timerState.duration >= 29 && timerState.stateFlag == true) {
        MainGameIdGenerator();
        timerState.stateFlag = false;
      }
      if (timerState.duration <= 12 && timerState.duration >= 11 &&timerState.stateFlag == false) {
        gameCardHandler(cardID.cardID)
        timerState.stateFlag = true;
      }
      if (timerState.duration <= 5 && timerState.duration >= 0 &&timerState.baitFlag == true) {
        baitWinHandler(cardID.cardID)
        timerState.baitFlag = false;
      }
      if (timerState.duration < 0) {
        // clearInterval(timerInterval);
        timerState.duration = 30;
        timerState.isRunning = false;
        timerState.baitFlag = true;
      }
  
      io.to("BonusTrailRoom").emit("gameUpdate", {gamestate: { value: timerState.duration }});
      // if(cardID?.cardID){
        sendMainCardData()
      // }
    }, 1000);
  }

}

io.on("connection", (socket) => {
  console.log("socket connected successfully");
  // console.log(socket);
  const userId = socket.handshake.query.userId;
  socket.join('BonusTrailRoom');
  registerUser(userId, socket);
  handleBait(userId, socket);
  updatedUserAfterWin(userId,socket)
  

  socket.on("disconnect", () => {
    console.log("socket disconnected successfully");
    // Clean up resources associated with the user ID when the socket disconnects
  });
});


function startGarbageCollectionTimer(interval) {
  const garbageCollectionTimer = setInterval(() => {
    // Trigger garbage collection
    global.gc();
    console.log("Garbage collection triggered.");

  }, interval);

  return garbageCollectionTimer;
}

// Set the interval for garbage collection (e.g., every 5 minutes)
const timer = startGarbageCollectionTimer(1000 * 60);

server.listen(PORT, async () => {
  try {
    await connection;
    starttimer()
    console.log("Connected to DB");
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.log(error);
  }
});
