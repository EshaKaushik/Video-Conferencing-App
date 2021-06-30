const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server,{
  cors: {
    origin: '*'
  }
});
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "esha20032001@gmail.com",
  auth: {
      user: "esha20032001@gmail.com",
      pass: "Esha@123"
  }
});
app.get('/send',function(req,res){
  var mailOptions={
      to : req.query.to,
      subject : req.query.subject,
      text : req.query.text
  }
  console.log(mailOptions);
  smtpTransport.sendMail(mailOptions, function(error, response){
   if(error){
          console.log(error);
      res.end("error");
   }else{
          console.log("Message sent: " + response.message);
      res.end("sent");
       }
});
});
 /* 
let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'eshakaushik2001@gmail.com',
        pass: 'Esha@2001'
    }
});
  
let mailDetails = {
    from: 'eshakaushik2001@gmail.com',
    to: 'esha_2k19co135@dtu.ac.in',
    subject: 'Test mail',
    text: 'Node.js testing mail for GeeksforGeeks'
};
  
mailTransporter.sendMail(mailDetails, function(err, data) {
    if(err) {
        console.log('Error Occurs');
    } else {
        console.log('Email sent successfully');
    }
});*/
/*
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eshakaushik2001@gmail.com',
    pass: 'Esha@2001'
  }
});

var mailOptions = {
  from: 'eshakaushik2001@gmail.com',
  to: 'esha_2k19co135@dtu.ac.in',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
*/
// Peer

const { ExpressPeerServer } = require("peer");
const { Console } = require("console");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.engine('html', require('ejs').renderFile);
app.get('/', function(req, res) {
  //res.render("index.html");
  //res.redirect(`/${uuidv4()}`);
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
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId,userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message,userName);
    });

    
    socket.on('offer', (data) => {
      socket.broadcast.emit('offer', data);
    });
  /*
    socket.on('initiate', (userId) => {
      console.log("Screen Shared");
      io.emit('initiate');
      console.log("test1");
    });
  */
  
    socket.on("initiate", () => {
      console.log("Screen Shared-2");
      io.to(roomId).emit("share-screen");
      console.log("test1");
      //io.broadcast.emit("initiate");
    });
    /*
    socket.on("initiate", (stream) => {
      console.log("Screen Shared-2");
      console.log(stream);
      io.to(roomId).emit("share-screen",stream);
      console.log("test1");
      //io.broadcast.emit("initiate");
    });
    */
    
  });
});

server.listen(process.env.PORT || 3030);


