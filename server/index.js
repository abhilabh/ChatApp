const express = require('express');
const socketIo = require('socket.io');
const http = require('http');

const router = require('./router')

const {addUser, removeUser, getUser, getUserInRoom}= require('./users');


const app = express();

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket)=>{
    console.log('We have a new connection')

    socket.on('Join', ({name, room}, callback)=>{
        console.log(name,room)

        const { error, user } = addUser({id: socket.id, name, room});
        if(error) return callback(error);
        socket.join(user.room);

        socket.emit('message',{user: 'admin' , text: `${user.name}, Welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message',{user: 'admin', text: `${user,name} has joined`});
        callback();
    });

    socket.on('disconnect', ()=>{
        console.log('user has left')
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left.`})
        }
    });

    socket.on('sendMessage', (message,callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('message', {user: user.name, text: message})
        callback();
    })

    
});
app.use(router);

server.listen(5000,()=> console.log('server is started on port 5000'));