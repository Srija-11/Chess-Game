const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const app = express();
const path = require('path');
const { title } = require('process');
const server = http.createServer(app);
const io = socket(server);
const chess = new Chess();
let players = {};
let currentPlayer = 'W';
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.render('index', {title : 'Chess Game'});
});
io.on('connection', (uniquesocket) => {
    console.log("Connected");
    if(!players.white){
        players.white= uniquesocket.id;
        uniquesocket.emit('playerRole', "w");
    }
    else if(!players.black){
        players.black= uniquesocket.id;
        uniquesocket.emit('playerRole', "b");
    }
    else{
        uniquesocket.emit('SpectatorRole');
    }

    uniquesocket.on('disconnect', () => {
        if(uniquesocket.id === players.white){
            delete players.white;
        }
        else if(uniquesocket.id === players.black){
            delete players.black;
        }
    });
    uniquesocket.on('move', (move) => {
        try{
            if(chess.turn()==="w" && uniquesocket.id !== players.white) return
               if(chess.turn()==="b" && uniquesocket.id !== players.black) return;
                const result=chess.move(move);
                if(result) {
                    currentPlayer = chess.turn();
                    io.emit('move', move);
                    io.emit("boardState", chess.fen());
                }else{
                console.log("Invalid Move",move);
                uniquesocket.emit('invalidMove', move);
                }
            } catch(err)
            {
                console.log(err);
                uniquesocket.emit('invalidMove', move);
            }
        });
    });
server.listen(port, () => {
  `Server started on port ${port}`;
});