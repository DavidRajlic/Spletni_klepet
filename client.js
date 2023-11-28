const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new net.Socket();

let username = '';

client.connect(3000, '127.0.0.1', () => {
  rl.question('Vnesite uporabniško ime: ', (input) => {
    username = input;
    client.write(`#J|${username}`);
  });

  rl.on('line', (input) => {
    client.write(`#M|${username} | ${input.trim()}`);
  });
});

client.on('data', (data) => {
  console.log(data.toString());
});

client.on('close', () => {
  console.log('Povezava zaprta');
  rl.close();
});
