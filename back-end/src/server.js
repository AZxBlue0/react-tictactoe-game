import http from 'http';
import { Server } from 'socket.io';
import path from 'path'
import { fileURLToPath } from 'url';
import express from 'express'
import { v4 as UUID } from 'uuid'

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

const createNewGame = (shouldCreateGame) => {
    return {
        id: UUID(),
        playerXMoves: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        playerOMoves: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        playerXSocket: null,
        playerOSocket: null,
        currentPlayer: 'X',
        isAutoJoin: !shouldCreateGame,
    }
}

io.on('connection', (socket) => {
    let { shouldCreateGame, gameId } = socket.handshake.query;
    shouldCreateGame === '' ? shouldCreateGame = false : shouldCreateGame = true;

    console.log(gamesInProgress[gameId]);
    let existingGame;

    if (gameId !== '') {
        existingGame = gamesInProgress[gameId];
    } else {
        existingGame = Object.values(gamesInProgress).find(
            game => !game.playerOSocket && game.isAutoJoin
        )
    }

    let game;
    console.log(shouldCreateGame);
    console.log(existingGame !== undefined);

    console.log(existingGame !== undefined && !shouldCreateGame);

    if (existingGame !== undefined && !shouldCreateGame) {
        game = existingGame;
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
            delete gamesInProgress[game.id];
        });
    } else {
        const newGame = createNewGame(!shouldCreateGame);
        if (shouldCreateGame) {
            socket.emit('gameId', newGame.id);
        }
        gamesInProgress[newGame.id] = newGame;
        newGame.playerXSocket = socket;
        console.log(`Player X has joined a game with id: ${newGame.id}`)

        socket.on('disconnect', () => {
            game.playerXSocket = undefined;
            if (game.playerOSocket) {
                game.playerOSocket.emit('info', ' Player X dippped');
                game.playerOSocket.disconnect();
                game.playerOSocket = undefined;
            }

            delete gamesInProgress[game.id];
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