const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

const players = {};
let games = [];

const checkWinner = (player1, player2) => {
  if (player1.option === player2.option) {
    return 0;
  }

  if (player1.option === "rock" && player2.option === "scissors") {
    return player1.player;
  }
  if (player1.option === "scissors" && player2.option === "paper") {
    return player1.player;
  }
  if (player1.option === "paper" && player2.option === "rock") {
    return player1.player;
  }

  if (player2.option === "rock" && player1.option === "scissors") {
    return player2.player;
  }
  if (player2.option === "scissors" && player1.option === "paper") {
    return player2.player;
  }
  if (player2.option === "paper" && player1.option === "rock") {
    return player2.player;
  }
};
io.on("connection", (socket) => {
  socket.emit("new-user", socket.id);
  players[socket.id] = { score: 0 };
  socket.on("play-turn", (value) => {
    games.push({ player: socket.id, option: value });
    if (games.length === 2) {
      const winner = checkWinner(games[0], games[1]);
      if (winner !== 0) {
        players[winner].score += 10;

        if (players[winner].score === 30) {
          io.emit("winner", winner);
        }

        //const score = `Score: ${players[games[]].score - }`
      }
      io.emit("score-change", players);
      games = [];
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("server running at http://localhost:3000");
});
