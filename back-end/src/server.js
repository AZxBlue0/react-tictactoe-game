import http from 'http';
import { Server } from 'socket.io';
import path from 'path'
import { fileURLToPath } from 'url';
import express from 'express'
import { v4 as UUID } from UUID

let expressApp = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

expressApp.use(express.static(path.join(__dirname, '../../front-end/build')));

expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front-end/build/index.html'))
});

let server = http.createServer(expressApp);
let io = new Server(server, {
    cors: {
        origin: '*'
    }
}
);

let gamesInProgress = {};

const createNewGame = () => {
    return {
        id: UUID(),
        playerXMoves: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        playerOMoves: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        playerXSocket: null,
        playerOSocket: null,
        currentPlayer: 'X'
    }
}

io.on('connection', (socket) => {
    const gameWithOnePlayer = Object.values(gamesInProgress).find(
        game => game.playerXSocket && !game.playerOSocket
    )
    let game;

    if (gameWithOnePlayer) {
        game = gameWithOnePlayer;
        game.playerOSocket = socket;
        game.playerOSocket.emit('start');
        game.playerXSocket.emit('start');

        game.playerOSocket.emit('other player turn');
        game.playerXSocket.emit('your turn');

        console.log(`Player O has joined game ${game.id}`);

        socket.on('disconnect', () => {
            game.playerOSocket = undefined;
            if (game.playerXSocket) {
                game.playerXSocket.emit('info', 'Player O dippped');
                game.playerXSocket.disconnect();
                game.playerXSocket = undefined;
            }
            delete gamesInProgress[newGame.id];
        });
    } else {
        const newGame = createNewGame();
        newGame.playerXSocket = socket;
        console.log(`Player X has joined a game with id: ${newGame.id}`)

        socket.on('disconnect', () => {
            newGame.playerXSocket = undefined;
            if (newGame.playerOSocket) {
                newGame.playerOSocket.emit('info', ' Player X dippped');
                newGame.playerOSocket.disconnect();
                newGame.playerOSocket = undefined;
            }

            delete gamesInProgress[newGame.id];
        });

        game = newGame;
    }

    socket.on('new move', (row, column) => {
        if (game.currentPlayer === 'X' && socket === game.playerXSocket) {
            game.playerXMoves[row, column] = 1;
            game.currentPlayer = "O";
            game.playerXSocket.emit('other player turn');
            game.playerOSocket.emit('your turn');

        } else if (game.currentPlayer === 'O' && socket === game.playerOSocket) {
            game.playerOMoves[row, column] = 1;
            game.currentPlayer = "X"
            game.playerOSocket.emit('other player turn');
            game.playerXSocket.emit('your turn');
        }
    })
});


server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});