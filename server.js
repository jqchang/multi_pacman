// Initialize Express
var express = require("express");
var app = express();
app.use(express.static(__dirname + '/static'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index');
});

var server = app.listen(8000, function() {
  console.log("listening on port 8000");
});

const BOARD_WIDTH = 28;
const BOARD_HEIGHT = 28;
const TICK_TIMER = 500;
const world = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,1,0,0,0,0,1,1,0,1,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,0,0,0,0,0,1,1,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1],
  [1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,1,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1],
  [0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0],
  [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

var io = require('socket.io').listen(server);
var players = {};
var spectators = {};
var ghosts = [];
var dots = [];
var deadplayers = [];
var messageLog = [];
var gameActive = false;
var gameLoop;

function checkTime(i) {
  if(i < 10) {
    i = "0" + i;
  }
  return i;
}

function addDots() {
  dots = [];
  for(var y = 0; y < BOARD_HEIGHT; y++) {
    for(var x = 0; x < BOARD_WIDTH; x++) {
      if(world[y][x] == 0) {
        dots.push({
          x: x,
          y: y,
          isCherry: (Math.random() < 0.05),
          isMeat: (Math.random() < 0.01)
        });
      }
    }
  }
}

function addGhosts() {
  ghosts = [
    { x: 9, y: 8 },
    { x: 18, y: 8 },
    { x: 9, y: 12},
    { x: 18, y: 12 }
  ];
}

function timestamp() {
  var time = new Date();
  return `${time.getHours()}:${checkTime(time.getMinutes())}:${checkTime(time.getSeconds())}`
}

function gameOver() {
  gameActive = false;
  clearInterval(gameLoop);
  var maxindex = -1;
  var maxscore = -1;
  var maxname = "";
  if(Object.keys(players).length == 0) {
    io.emit("game_over", {
      timestamp:timestamp(),
      contents:`All players are dead!`,
      players:players,
      spectators:spectators
    });
  }
  else {
    for(var i in players) {
      if(players[i].score > maxscore) {
        maxscore = players[i].score;
        maxindex = i;
        maxname = players[i].name;
      }
    }
    for(var i in players) {
      spectators[i] = {
        name:players[i].name
      }
      delete players[i];
    }
    console.log("Game over");
    console.log("Players:", players);
    console.log("Spectators:", spectators);

    io.emit("game_over", {
      timestamp:timestamp(),
      contents:`${maxname} wins with ${maxscore} points!`,
      players:players,
      spectators:spectators
    });
  }
}

function playerDead(id) {
  if (!players[id]) {
    return false;
  }
  console.log(id);
  var deadscore = players[id].score;
  var deadname = players[id].name;
  var deadid = id
  spectators[id] = {
    name:deadname
  }
  delete players[id];
  io.emit("dead_player", {
    timestamp:timestamp(),
    contents:`${deadname} was killed with ${deadscore} points!`,
    dead_id: id,
    players:players,
    spectators:spectators
  });
  if(Object.keys(players).length == 0) {
    gameOver();
  }
}

function movePlayer(player, x, y) {
  if(x == -1 && y == 15) {
    player.x = BOARD_WIDTH-1;
  }
  else if (x == BOARD_WIDTH && y == 15) {
    player.x = 0;
  }
  else if(x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT && world[y][x] != 1) {
    player.x = x;
    player.y = y;
  }
  for(var i in dots) {
    if(dots[i].x == player.x && dots[i].y == player.y) {
      player.score += 10;
      if(dots[i].isCherry) { player.score += 20; }
      if(dots[i].isMeat) {
        player.godMode = 30;
      }
      dots.splice(i, 1);
    }
  }
}

function moveGhost(ghost, x, y) {
  originalPos = [ghost.x, ghost.y];
  // TELEPORT SPECIAL CASE
  if(x == -1 && y == 15) {
    ghost.x = BOARD_WIDTH-1;
  }
  else if (x == BOARD_WIDTH && y == 15) {
    ghost.x = 0;
  }
  // TELEPORT SPECIAL CASE
  else if(x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT && world[y][x] != 1) {
    ghost.x = x;
    ghost.y = y;
  }

  while(ghost.x == originalPos[0] && ghost.y == originalPos[1]) {
    var rand = Math.floor(Math.random()*4);
    switch(rand) {
        case 0:
        if(world[ghost.y][ghost.x+1] == 0) {
          ghost.x++;
        }
        break;
        case 1:
        if(world[ghost.y][ghost.x-1] == 0) {
          ghost.x--;
        }
        break;
        case 2:
        if(world[ghost.y-1][ghost.x] == 0) {
          ghost.y--;
        }
        break;
        case 3:
        if(world[ghost.y+1][ghost.x] == 0) {
          ghost.y++;
        }
        break;
        default:
        break;
    }
  }
}

function update() {
  updatePlayers();
  updateGhosts();
  checkCollisions();
}

function updateGhosts() {
  // Target the player with highest health
  var target;
  for(var i in players) {
    if(target === undefined) {
      target = players[i]
    }
    else {
      if(players[i].score > target.score) {
        target = players[i]
      }
    }
  }
  for(var i in ghosts) {
    var deltaX = ghosts[i].x - target.x;
    var deltaY = ghosts[i].y - target.y;
    if(Math.abs(deltaX) > Math.abs(deltaY)){
      if(deltaX > 0) {
        moveGhost(ghosts[i], ghosts[i].x-1, ghosts[i].y);
      }
      else {
        moveGhost(ghosts[i], ghosts[i].x+1, ghosts[i].y);
      }
    }
    else {
      if(deltaY > 0) {
        moveGhost(ghosts[i], ghosts[i].x, ghosts[i].y-1);
      }
      else {
        moveGhost(ghosts[i], ghosts[i].x, ghosts[i].y+1);
      }
    }
  }
  // var delta = [];
  // for(var i in ghosts) {
  //   switch(Math.floor(Math.random()*4)) {
  //     case 0:
  //     delta.push([1,0]);
  //     break;
  //     case 1:
  //     delta.push([0,-1]);
  //     break;
  //     case 2:
  //     delta.push([-1,0]);
  //     break;
  //     case 3:
  //     delta.push([0,1]);
  //     break;
  //     default:
  //     break;
  //   }
  // }
  // for(var i in ghosts) {
  //   moveGhost(ghosts[i], ghosts[i].x+delta[i][0], ghosts[i].y+delta[i][1]);
  // }
}

function checkCollisions() {
    //check ghost & player collision
    for(var i in players) {
      for(var j in ghosts) {
        if(players[i].x == ghosts[j].x && players[i].y == ghosts[j].y) {
          if(players[i].godMode > 0) {
            ghosts.splice(j,1);
            players[i].score += 30;
          }
          else {
            deadplayers.push(i);
          }
        }
      }
      // check for evil pacman eat
      for(var k in players) {
        if(players[i].x == players[k].x && players[i].y == players[k].y && i != k) {
          console.log("collision between", i, k);
          console.log("godmode", players[i].godMode, players[k].godMode);
          if (players[k].godMode > 0 && players[i].godMode == 0){
            deadplayers.push(i);
            players[k].score += 100;
          }
          if (players[i].godMode > 0 && players[k].godMode == 0){
            deadplayers.push(k);
            players[i].score += 100;
          }
        }
      }
    }
    for(var i in deadplayers) {
      playerDead(deadplayers[i]);
    }
}

function updatePlayers() {
  for(var i in players) {
    var nextX = players[i].x;
    var nextY = players[i].y;
    switch(players[i].direction) {
      case 'E':
      nextX++;
      break;
      case 'N':
      nextY--;
      break;
      case 'W':
      nextX--;
      break;
      case 'S':
      nextY++;
      break;
      default:
      break;
    }
    movePlayer(players[i], nextX, nextY);
    if(players[i].godMode > 0) {
      players[i].godMode--;
    }
    if(dots.length == 0) {
      gameOver();
    }
    io.emit("game_state", {
      timestamp:timestamp(),
      sender: "Server",
      players: players,
      spectators: spectators,
      dots: dots,
      ghosts: ghosts
    })
  }
}

io.sockets.on('connection', function(socket){
  console.log("Connection established with", socket.id);
  socket.on("new_user", function(data) {
    spectators[socket.id] = {
      name: data.name
    }
    for(var i = 0; i < messageLog.length; i++) {
      socket.emit("message", messageLog[i]);
    }
    socket.emit("new_connect", {timestamp: timestamp(), contents:`Welcome ${data.name}!`, players:players, spectators:spectators, ghosts:ghosts});
    socket.broadcast.emit("new_connect", {timestamp: timestamp(), contents:`${data.name} has joined the channel.`, players:players, spectators:spectators, dots:dots, ghosts:ghosts});
  });
  socket.on("send_message", function(data) {
    messageLog.push(data);
    if(data.contents == "/join") {
      if(gameActive) {
        socket.emit("message", {timestamp: timestamp(), sender: "Server", contents: "Cannot join - game is in progress!"});
      }
      else if (Object.keys(players).length >= 4) {
        socket.emit("message", {timestamp: timestamp(), sender: "Server", contents: "Cannot join - game is full!"});
      }
      else if (players[socket.id]){
        socket.emit("message", {timestamp: timestamp(), sender: "Server", contents: "You are already in this game!"});
      }
      else if (spectators[socket.id]){
        players[socket.id] = spectators[socket.id];
        players[socket.id].num = Object.keys(players).length;
        players[socket.id].score = 0;
        players[socket.id].godMode = 0;
        switch(players[socket.id].num) {
          case 1:
          players[socket.id].x = 1;
          players[socket.id].y = 1;
          players[socket.id].direction = 'E';
          break;
          case 2:
          players[socket.id].x = BOARD_WIDTH-2;
          players[socket.id].y = BOARD_HEIGHT-2;
          players[socket.id].direction = 'W';
          break;
          case 3:
          players[socket.id].x = 1;
          players[socket.id].y = BOARD_HEIGHT-2;
          players[socket.id].direction = 'E';
          break;
          case 4:
          players[socket.id].x = BOARD_WIDTH-2;
          players[socket.id].y = 1;
          players[socket.id].direction = 'W';
          break;
        }
        delete spectators[socket.id];
        io.emit("join_game", {players:players, spectators:spectators, dots:dots, ghosts:ghosts});
        socket.emit("assign_playnum", {playNum:Object.keys(players).length})
      }
    }
    io.emit("message", {timestamp: data.timestamp, sender: data.sender, contents: data.contents});
    if(data.contents == "/start") {
      if(Object.keys(players).length == 0) {
        socket.emit("message", {timestamp: timestamp(), sender: "Server", contents: `Game needs at least 1 player to start!`});
      }
      else if(!gameActive) {
        gameActive = true;
        deadplayers = [];
        addDots();
        addGhosts();
        console.log("Ghosts added");
        console.log(ghosts);
        gameLoop = setInterval(update, TICK_TIMER);
      }
    }
    if(data.contents == "/choi") {
      if(players[socket.id]) {
        io.emit("message", {timestamp: timestamp(), sender: "Server", contents: `${players[socket.id].name} has invoked the power of Michael Choi!`});
      }
      else {
        io.emit("message", {timestamp: timestamp(), sender: "Server", contents: `${spectators[socket.id].name} has invoked the power of Michael Choi!`});
      }
    }
    if(data.contents == "/help") {
      socket.emit("message", {timestamp: timestamp(), sender: "Michael Choi", contents: "Strength through Struggle!"});
    }
  });
  socket.on("direction", function(data) {
    if(players[socket.id]) {
      switch(data.direction) {
        case 37:
        players[socket.id].direction = 'W';
        break;
        case 38:
        players[socket.id].direction = 'N';
        break;
        case 39:
        players[socket.id].direction = 'E';
        break;
        case 40:
        players[socket.id].direction = 'S';
        break;
        default:
        players[socket.id].direction = '?';
        break;
      }
    }
  });

  socket.on('disconnect', function() {
    console.log(socket.id, "has disconnected");
    if(players[socket.id]) {
      console.log("Player disconnected:", players[socket.id].name);
      var lostname = players[socket.id].name;
      delete players[socket.id];
      io.emit("lost_user", {timestamp: timestamp(), contents: `Player ${lostname} has disconnected.`, players:players, spectators:spectators, dots:dots, ghosts:ghosts});
    }
    if(spectators[socket.id]) {
      console.log(`${spectators[socket.id].name} has left the channel.`)
      var lostname = spectators[socket.id].name;
      delete spectators[socket.id];
      io.emit("lost_user", {timestamp: timestamp(), contents: `${lostname} has left the channel.`, players:players, spectators:spectators, dots:dots, ghosts:ghosts});
    }
    if(Object.keys(players).length <= 0) {
      gameActive = false;
      clearInterval(gameLoop);
    }
  });
});
