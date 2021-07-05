const express = require("express");
var nodemailer = require('nodemailer');
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server,{
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const { Console } = require("console");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

function sent_mail(mail_id,link){  
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'eshakaushik2001@gmail.com',
      pass: 'Esha@20032001'
    }
  });

  var mailOptions = {
    from: 'eshakaushik2001@gmail.com',
    to: mail_id,
    subject: 'This message has been send by Esha Kaushik for joining the meeting',
    text:link
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

  // Peer




app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.engine('html', require('ejs').renderFile);
app.get('/', function(req, res) {
  res.render("index.html");
});

app.get('/feedback', function(req, res) {
  res.render("feedback.html");
});

app.get("/direct", (req, rsp) => {
  rsp.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  roomId=`/${uuidv4()}`;
  console.log(roomId);
  res.render("room", { roomId: req.params.room });
});
const users = {};
io.on("connection", (socket) => {
  
  socket.on("join-room", (roomId, userId,userName) => {
    if(!users[socket.id]){
      users[socket.id]=userName;
    }
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message,userName);
    });

    socket.on("disconnect", () => {
      io.to(roomId).emit('userLeft', userName);
      delete users[socket.id];
      console.log(users);
    });
    
    socket.on('offer', (data) => {
      socket.broadcast.emit('offer', data);
    });
  
    socket.on("initiate", () => {
      io.to(roomId).emit("share-screen");
    });
    
    socket.on("mail_sent",(mail_id,link) =>{
      sent_mail(mail_id,link);
      io.to(roomId).emit("success");
    });
  });
});

server.listen(process.env.PORT || 80);