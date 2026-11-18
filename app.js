
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const chess = new Chess();
let players = {};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', { title: 'Chess Game' });
});

io.on('connection', (uniquesocket) => {
    console.log('Connected:', uniquesocket.id);

    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit('playerRole', 'w');
    } 
    else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit('playerRole', 'b');
    } 
    else {
        uniquesocket.emit('SpectatorRole');
    }
    uniquesocket.emit('boardState', chess.fen());

    uniquesocket.on('disconnect', () => {
        if (uniquesocket.id === players.white) {
            delete players.white;
        } 
        else if (uniquesocket.id === players.black) {
            delete players.black;
        }
    });

    uniquesocket.on('move', (move) => {
        try {
            if (chess.turn() === 'w' && uniquesocket.id !== players.white) return;
            if (chess.turn() === 'b' && uniquesocket.id !== players.black) return;

            const result = chess.move(move);

            if (result) {
                io.emit('move', move);
                io.emit('boardState', chess.fen());
            } else {
                uniquesocket.emit('invalidMove', move);
            }
        } catch (err) {
            console.log(err);
            uniquesocket.emit('invalidMove', move);
        }
    });
});

// Local development
if (require.main === module) {
    const port = process.env.PORT || 8080;
    server.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}

// Vercel deployment
module.exports = server;
