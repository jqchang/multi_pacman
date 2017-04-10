$(document).ready(function(){
  const ENTER = 13;
  const BACKSLASH = 191;
  const ARROW_LEFT = 37;
  const ARROW_UP = 38;
  const ARROW_RIGHT = 39;
  const ARROW_DOWN = 40;
  const BOARD_WIDTH = 28;
  const BOARD_HEIGHT = 28;
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

  var socket = io.connect();
  var name = prompt("Please enter your name", "Your Name");
  var msgCount = 0;
  var chatActive = false;
  var playerNum = -1;



  function initClientBoard() {
    var boardtext = "";
    for(var y = 0; y < BOARD_HEIGHT; y++) {
      boardtext += (`<tr id='row${y}'></tr>`);
      for(var x = 0; x < BOARD_WIDTH; x++) {
        world[y][x];
        boardtext += (`<td id='row${y}col${x}'>${boardimg(world[y][x])}</td>`);
      }
    }
    $('#world').html(boardtext);
  }

  function updateBoard(data) {
    initClientBoard();
    for(var i in data.dots) {
      if(data.dots[i].isMeat) {
        $(`#row${data.dots[i].y}col${data.dots[i].x} div`).html("<img class='cherry' src='meat.png' alt='meat'></img>");
      }
      else if(data.dots[i].isCherry) {
        $(`#row${data.dots[i].y}col${data.dots[i].x} div`).html("<img class='cherry' src='cherry.png' alt='cherry'></img>");
      }
      else {
        $(`#row${data.dots[i].y}col${data.dots[i].x} div`).html("<img class='dot' src='dot.jpg' alt='dot'></img>");
      }
    }
    for(var i in data.players) {
      var imgstring = `<img class='pacman' src='pacman.png' alt='pacman'></img>` // default;
      if(data.players[i].godMode > 0) {
        imgstring = `<img class='pacman${data.players[i].num}' src='pacman_predator.png' alt='pacman'></img>`
      }
      else {
        switch(data.players[i].num) {
          case 1:
          imgstring = `<img class='pacman1' src='pacman.png' alt='pacman'></img>`
          break;
          case 2:
          imgstring = `<img class='pacman2' src='pacman_red.png' alt='pacman'></img>`
          break;
          case 3:
          imgstring = `<img class='pacman3' src='pacman_pink.png' alt='pacman'></img>`
          break;
          case 4:
          imgstring = `<img class='pacman4' src='pacman_cyan.png' alt='pacman'></img>`
          break;
          default:
          break;
        }
      }
      $(`#row${data.players[i].y}col${data.players[i].x} div`).html(imgstring);
      switch(data.players[i].direction) {
        case 'W':
        $(`.pacman${data.players[i].num}`).css("transform",`rotate(180deg)`);
        break;
        case 'N':
        $(`.pacman${data.players[i].num}`).css("transform",`rotate(270deg)`);
        break;
        case 'E':
        $(`.pacman${data.players[i].num}`).css("transform",`rotate(0deg)`);
        break;
        case 'S':
        $(`.pacman${data.players[i].num}`).css("transform",`rotate(90deg)`);
        break;
        default:
        break;
      }
    }
    console.log(data.ghosts);
    for(var i in data.ghosts) {
      console.log(data.ghosts[i].x, data.ghosts[i].y);
      $(`#row${data.ghosts[i].y}col${data.ghosts[i].x} div`).html("<img class='ghost' src='ghost.png' alt='ghost'></img>");
    }
  }

  function boardimg(tile) {
    switch(tile) {
      case 0:
      return '<div class="background"></div>';
      break;
      case 1:
      return '<div class="brick"></div>';
      break;
      default:
      return tile;
      break;
    }
  }

  function checkTime(i) {
    if(i < 10) {
      i = "0" + i;
    }
    return i;
  }
  function timestamp() {
    var time = new Date();
    return `${time.getHours()}:${checkTime(time.getMinutes())}:${checkTime(time.getSeconds())}`
  }

  function refreshUserlist(data) {
    var userlist = "<p>Players:</p>";
    for(var i in data.players) {
      userlist += `<p id='user${i}'></p>`
    }
    userlist += "<p>Spectators:</p>";
    for(var i in data.spectators) {
      userlist += `<p id='user${i}'></p>`
    }
    $('#userlist').html(userlist);
    for(var j in data.players) {
      $(`#user${j}`).text(data.players[j].name+": "+data.players[j].score+" pts");
    }
    for(var j in data.spectators) {
      $(`#user${j}`).text(data.spectators[j].name);
    }
  }

  var sendMessage = function(sock) {
    if ($('#msg').val() !== ''){
      var data = {
        timestamp: timestamp(),
        sender: name,
        contents:$('#msg').val()
      }
      sock.emit("send_message", data);
      $('#msg').val('');
    }
  }
  socket.emit("new_user", {name:name});
  initClientBoard();

  socket.on("message", function(data) {
    $('#log').append(`<p id='msg${msgCount}'></p>`)
    $(`#msg${msgCount++}`).text(`(${data.timestamp}) ${data.sender}: ${data.contents}`)
    $('#log').scrollTop($('#log')[0].scrollHeight);
  });

  socket.on("new_connect", function(data) {
    $('#log').append(`<p id='msg${msgCount}'></p>`)
    $(`#msg${msgCount++}`).text(`(${data.timestamp}) ${data.contents}`)
    $('#log').scrollTop($('#log')[0].scrollHeight);
    refreshUserlist(data);
  });

  socket.on("lost_user", function(data) {
    $('#log').append(`<p id='msg${msgCount}'></p>`)
    $(`#msg${msgCount++}`).text(`(${data.timestamp}) ${data.contents}`)
    $('#log').scrollTop($('#log')[0].scrollHeight);
    refreshUserlist(data);
  });

  socket.on("dead_player", function(data) {
    $('#log').append(`<p id='msg${msgCount}'></p>`);
    if(socket.id == data.id) {
      $(`#msg${msgCount++}`).text(`(${data.timestamp}) You are dead!`)
      playerNum = -1;
    }
    else {
      $(`#msg${msgCount++}`).text(`(${data.timestamp}) ${data.contents}`)
    }
    $('#log').scrollTop($('#log')[0].scrollHeight);
    refreshUserlist(data);
  });

  socket.on("game_over", function(data) {
    $('#log').append(`<p id='msg${msgCount}'></p>`)
    $(`#msg${msgCount++}`).text(`(${data.timestamp}) ${data.contents}`)
    $('#log').scrollTop($('#log')[0].scrollHeight);
    playerNum = -1;
    refreshUserlist(data);
  });

  socket.on("join_game", function(data) {
    refreshUserlist(data);
    updateBoard(data);
  });

  socket.on("assign_playnum", function(data) {
    playerNum = data.playNum;
  });

  $('#send').click(function() {
      sendMessage(socket);
  });

  $(document).keydown(function(e) {
    // Press ENTER to send message
    if(e.keyCode == ENTER) {
      if(chatActive) {
        sendMessage(socket);
        $('#msg').blur();
        $(document).scrollTop($('head')[0].scrollHeight);
        chatActive = false;
      }
      else {
        $('#msg').focus();
        chatActive = true;
      }
    }
    if(e.keyCode >= ARROW_LEFT && e.keyCode <= ARROW_DOWN && playerNum != -1) {
      e.preventDefault();
      socket.emit("direction", {direction: e.keyCode})
    }
  });

  socket.on("game_state", function(data) {
    updateBoard(data);
    refreshUserlist(data);
  });
  $('#msg').click(function() {
    $(this).blur();
  });
});
