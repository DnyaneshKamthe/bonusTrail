// userId,socket.id,socket

const { UserMaster } = require("../models/bonusTrail.game");

// const {GameUser}
const registerUser = async (userId, socket) => {
  try {
    if(!userId){
      console.log({ msg: "error in register user:- userId not found" });
      // callback("userId not found")
      return
    }
    const user = await UserMaster.findOne({_id:userId});

    if (!user) {
      // throw new Error({ msg: "user not found" });
      console.log({ msg: "error in register user:- user not found" });
    }
    user.save()
    socket.emit("userDetails", {
      user,
    });
  } catch (error) {
    console.error("Error initializing game state:", error.message);
  }
};


const updatedUserAfterWin =(userId,socket)=>{
    socket.on("getUpdatedUserDetails",async()=>{
      if(!userId){
        console.log({msg:'user not found in updatedUserAfterWin'})
        return
      }
      let user = await UserMaster.findOne({ _id: userId });
        if(!user){
          console.log({msg:'user not found'})
          return
        }

        socket.emit("userDetails", {
          user,
        });
    })
}

module.exports = { registerUser,updatedUserAfterWin };


