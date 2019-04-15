var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
   console.log(req.params)
   console.log(req.query)
   res.send(true)
   // res.sendFile(__dirname + '/html/index.html');
});

app.post('/', function(req, res) {
   console.log(req.body)
   res.send(true)
   // res.sendFile(__dirname + '/html/index.html');
});

app.put('/', function(req, res) {
   console.log(req.body)
   res.send(true)
   // res.sendFile(__dirname + '/html/index.html');
});

app.get('/emit', function(req, res) {
   res.sendFile(__dirname + '/html/emit.html');
});


app.get('/broadcast', function(req, res) {
   res.sendFile(__dirname + '/html/broadcast.html');
});

app.get('/namespaces', function(req, res) {
   res.sendFile(__dirname + '/html/namespaces.html');
});

app.get('/room', function(req, res) {
   res.sendFile(__dirname + '/html/room.html');
});

app.get('/chat', function(req, res) {
   res.sendFile(__dirname + '/html/chat.html');
});
users = [];
var roomno = 1;
var clients = 0;
//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   clients++;

   io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});

   setTimeout(function() {
      socket.send(`Sent a message 4seconds after connection! ${new Date()}`);
   }, 4000);

   //Send a message when 
   setTimeout(function() {
      //Sending an object when emmiting an event
      socket.emit('testerEvent', { description: 'A custom event named testerEvent!'});
   }, 4000);

   	socket.on('clientEvent', function(data) {
	  console.log(data);
	});

   if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) roomno++;
   socket.join("room-"+roomno);

   //Send this event to everyone in the room.
   io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);


   socket.on('setUsername', function(data) {
      console.log(data);
      
      if(users.indexOf(data) > -1) {
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push(data);
         socket.emit('userSet', {username: data});
      }
   });
   
   socket.on('msg', function(data) {
      //Send message to everyone
      io.sockets.emit('newmsg', data);
   })


   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      clients--;
      io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
   });
});


var nsp = io.of('/my-namespace');
nsp.on('connection', function(socket) {
   console.log('someone connected');
   nsp.emit('hi', 'Hello everyone!');
});


http.listen(6000, function() {
   console.log('listening on *:6000');
});