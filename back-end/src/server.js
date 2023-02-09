import http from 'http';
import { Server } from 'socket.io';

let server = http.createServer();
let io = new Server(server, {
    cors: {
        origin: '*'
    }
}
);

let playerXSocket;
let playerOSocket;

io.on('connection', (socket) => {
    if (playerXSocket) {
        playerOSocket = socket;
        playerOSocket.emit('start');
        playerXSocket.emit('start');
        
        playerOSocket.emit('other player turn');
        playerXSocket.emit('your turn');

        console.log('Player O has joined. Starting the game');

        socket.on('disconnect', () => {
            playerOSocket = undefined;
            if (playerXSocket) {
                playerXSocket.emit('info', 'Player 2 dippped');
                playerXSocket.disconnect();
                playerXSocket = undefined;
            }
        });
    } else {
        playerXSocket = socket;
        console.log('Player X has joined');

        socket.on('disconnect', () => {
            playerXSocket = undefined;
            if (playerOSocket) {
                playerOSocket.emit('info', 'Player 2 dippped');
                playerOSocket.disconnect();
                playerOSocket = undefined;
            }
        });
    }
});


server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});