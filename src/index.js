//jshint esversion:6
const express=require("express");
const socketio=require("socket.io");
const http=require("http");
const app=express();
const server=http.createServer(app);
const io=socketio(server);
const Filter=require("bad-words");
const {generateMessage,generateLocationMessage}=require("./utils/messages");
const {addUser,removeUser,getUser,getUserInRoom}=require("./utils/users");

const port=process.env.PORT || 3000;
const path=require("path");


const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
// let count=0;

io.on("connection",(socket)=>{
    console.log("new socket connect");
    // socket.emit("countUpdated",count);
    socket.on("join",({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room});
        if(error){
            return callback(error);
        }

        socket.join(user.room);

        socket.emit("message",generateMessage("Admin","wellcome!!!"));
        socket.broadcast.to(user.room).emit("message",generateMessage("Admin",`${user.username} has joined`));
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUserInRoom(user.room)
        });
        callback();
    });


    //when send location button is clicked in html page chat.js sendlocation emit position
    socket.on("sendLocation",(coords,callback)=>{
        const user=getUser(socket.id);
        io.to(user.room).emit("locationMessage",generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });


    socket.on("messageClient",(message,callback)=>{
        const user=getUser(socket.id);
        const filter=new Filter();
        if(filter.isProfane(message)){
            return callback("Theri paadilla");
        }

        io.to(user.room).emit("message",generateMessage(user.username,message));
        callback();
    });
    socket.on("disconnect",()=>{
        const user=removeUser(socket.id);

        if(user){
            io.to(user.room).emit("message",generateMessage("Admin",`${user.username}has left!`));
            io.to(user.room).emit("roomData",{
                room:user.room,
                users:getUserInRoom(user.room)
            });
        }
    
    });
});

server.listen(port,()=>{
    console.log("server up");
}); 