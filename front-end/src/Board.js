import { useState } from 'react';
import { useEffect } from 'react';

export const Board = () => {
    const [playerTurn, setPlayerTrun] = useState('X');
    const [playerXMoves, setPlayerXMoves] = useState([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    const [playerOMoves, setPlayerOMoves] = useState([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);

    const togglePlayer = () => {
        if (playerTurn === 'X') {
            setPlayerTrun('O');
        } else {
            setPlayerTrun('X');
        }
    }

    useEffect(() => {
        console.log(playerXMoves, playerOMoves)
    }, [playerOMoves, playerXMoves]);

    const handleTurn = (x, y) => {
        if (playerTurn === 'X') {
            const newMoves = [...playerXMoves];
            newMoves[x][y] = 1;
            setPlayerXMoves(newMoves);
        } else {
            const newMoves = [...playerOMoves];
            newMoves[x][y] = 1;
            setPlayerOMoves(newMoves);
        }

        togglePlayer();
    }

    return (
        <>
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
            <div>ist's players {playerTurn} turn!</div>
        </>
    )
}