const net = require('net');

const clients = [];
let gameStarted = false;
let wordToGuess = '';
let guessedWord = '';
const words = ['banana', 'apple', 'orange', 'grape', 'kiwi']; // Seznam besed za igro
const scores = {}; // Objekt za shranjevanje točk odjemalcev

const getRandomWord = () => {
  return words[Math.floor(Math.random() * words.length)];
};

const startGame = () => {
  if (!gameStarted) {
    wordToGuess = getRandomWord();
    const wordLength = wordToGuess.length;
    guessedWord = wordToGuess[0] + '_'.repeat(wordLength - 2) + wordToGuess[wordLength - 1];
    gameStarted = true;
    clients.forEach((client) => {
      client.write(`Igra se je začela. Ugibajte besedo: ${guessedWord}`);
    });
  }
}

const stopGame = () => {
  if (gameStarted) {
    gameStarted = false;
    return `Igra je končana. Iskana beseda je bila: ${wordToGuess}`;
  }
  return 'Igra še ni začeta.';
};

const sendScoresToAllClients = () => {
  let scoresMessage = '\nTrenutne točke:\n';
  for (const [username, score] of Object.entries(scores)) {
    scoresMessage += `${username}: ${score}\n`;
  }
  clients.forEach((client) => {
    client.write(scoresMessage);
  });
};

let gameIsOn = false;
const server = net.createServer((socket) => {
  clients.push(socket);
  socket.on('data', (data) => {
    try {
      const clientMessage = data.toString().trim();
      console.log(`${clientMessage}`);
      
      const words = clientMessage.split(" "); // Razbijanje niza glede na presledek
      const lastWord = words[words.length - 1]; 
      
      if (clientMessage.startsWith('#M|')) {
        const word = clientMessage.replace("#M|", " "); 
        clients.forEach((client) => {
          client.write(word);
        });
      }
      
      if (lastWord === '#GAMESTART') {
        console.log("najs");
        startGame();
        gameIsOn = true;
      
      } else if (lastWord === '#GAMESTOP') {
        gameIsOn = false;
        const response = stopGame();
        clients.forEach((client) => {
          client.write(response);
        });
      } else if(gameIsOn) {
        if (lastWord === wordToGuess) {
          const word = clientMessage.replace("#M|", "");
          const bigWord = word.split(" ");
          const user = bigWord[0];
          stopGame();
          
          // Povečaj točke uporabnika in izpiši rezultat
          if (!scores[user]) {
            scores[user] = 1; // Dodeli prvo točko
          } else {
            scores[user]++; // Povečaj točke
          }
          
          // Pošlji vsem odjemalcem trenutne točke vseh igralcev
          sendScoresToAllClients();
        } else {
          clients.forEach((client) => {
            client.write("Ni prava beseda");
          });
        }
      } 
    } catch (error) {
      console.error('Napaka pri obdelavi sporočila:', error.message);
    }
  });

  socket.on('end', () => {
    console.log('Odjemalec je prekinil povezavo.');
    clients.splice(clients.indexOf(socket), 1);
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Strežnik posluša na portu ${PORT}`);
});
