import { useState } from 'react';
import { useEffect } from 'react';
import socketIoClient from 'socket.io-client'
export const Board = ({isHost, gameiId}) => {
    const [playerTurn, setPlayerTrun] = useState('X');
    const [playerXMoves, setPlayerXMoves] = useState([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    const [playerOMoves, setPlayerOMoves] = useState([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);

    const [gameId, setGameId] = useState('');

    const [socket, setSocket] = useState(null);
    const [playerIsWaiting, setPlayerIsWaiting] = useState(true);
    const [isPlayersTurn, setIsPlayersTurn] = useState(false);


    useEffect(() => {
        console.log(gameiId);
        let newSocket = socketIoClient('http://127.0.0.1:8080', {
            query: {
                shouldCreateGame: isHost ? true : '',
                gameId: gameiId ? gameiId : '',
            }
        });
        setSocket(newSocket);
        newSocket.on('info', (data) => {
            //alert(data);
        })
        newSocket.on('gameId', (gameId) => {
            setGameId(gameId);
        })
        newSocket.on('start', () => {
            setPlayerIsWaiting(false);
            ///alert('Both Players are ready, starting the game')
        });


        newSocket.on('other player turn', () => {
            setIsPlayersTurn(false);
        });

        newSocket.on('your turn', () => {
            setIsPlayersTurn(true);
        });


        return () => { newSocket.disconnect() };
    }, [])

    useEffect(() => {
        console.log(playerXMoves, playerOMoves)
    }, [playerOMoves, playerXMoves]);

    const handleTurn = (x, y) => {
        socket.emit('new move', x, y);
    }
    if(isHost && playerIsWaiting){
        return <h1>You are the Host. Game ID: {gameId}</h1>   
    }
    if (playerIsWaiting) {
        return <h1>You are the first player. Waiting for another player to join</h1>
    }

    return (
        <>
            <h1>Tic Tac Toe</h1>
            <table>
                <tbody>
                    {
                        [0, 1, 2].map(row =>
                            <tr key={`${row}`}>
                                {[0, 1, 2].map(column =>
                                    <td key={`${row}${column}`} onClick={() => handleTurn(row, column)}>
                                        {playerOMoves[row][column] === 1 && 'O'}
                                        {playerXMoves[row][column] === 1 && 'X'}

                                    </td>
                                )}
                            </tr>
                        )
                    }
                </tbody>
            </table>
            <div>ist's {isPlayersTurn ? 'Your' : 'the other players'} turn!</div>
        </>
    )
}