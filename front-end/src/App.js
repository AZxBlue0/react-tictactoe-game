import './App.css';
import { useState } from 'react';
import { Board } from './Board';

function App() {
  const [gameMode, setGameMode] = useState('');
  const [gameIdText, setGameIdText] = useState('')
  const [gameId, setGameId] = useState('')

  return (
    <>
      {!gameMode && (
        <>
          <button onClick={() => setGameMode('auto')}>Automatic mathc-up</button>
          <button onClick={() => setGameMode('host')}>Host a game</button>
          <button onClick={() => setGameMode('join')}>Join by id</button>
        </>
      )}

      {gameMode === 'auto' &&
        <Board isHost={false} />
      }
      {gameMode === 'host' &&
        <Board isHost={true} />
      }
      {gameMode === 'join' &&
        (
          gameId !== '' ? (
            <Board gameiId={gameId} />
          ) : (
            <>
              <input type='text'
                placeholder='enter game id you want to join'
                value={gameIdText}
                onChange={e => setGameIdText(e.target.value)}
              />
              <button onClick={() => { setGameId(gameIdText) }}>Join</button>
            </>
          ))
      }


    </>
  );
}

export default App;
