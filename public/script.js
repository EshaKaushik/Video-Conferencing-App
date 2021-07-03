const socket = io("/");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
//
myVideo.muted = true;
var myUserId="";
//


//
const peers={};
const user_list=[];
const user = prompt("Enter your name");
if(user.trim().length ==0){
  document.write("Enter the username is mandatory to create a room  ");
  
}

user_list.push(user);
console.log(user_list);

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "video-conferencing-webapp.herokuapp.com",
  port: 443,
  secure: true,
});

let myVideoStream;

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
      peer.peerConnection.onconnectionstatechange = function (event) {
        if (event.currentTarget.connectionState === 'disconnected') {
          peer.close();
        }
      };

    });

  socket.on("user-connected", (userId) => {
    myUserId=userId;
    connectToNewUser(userId, stream);
  });
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

//me
let chatInputBox = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");
//
send.addEventListener("click", (e) => {
  if (chatInputBox.value.length !== 0) {
    socket.emit("message", chatInputBox.value);
    chatInputBox.value = "";
  }
});
chatInputBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && chatInputBox.value != "") {
    socket.emit("message", chatInputBox.value);
    chatInputBox.value = "";
  }
});

socket.on("createMessage", (message, userName) => {
  const receivedMsg = `
  <div class="message_recieve" id ="msg">
        <b><i class="fa fa-user-circle"></i> <span> ${
           userName 
        }</span> </b><br>
        <span >&nbsp &nbsp&nbsp&nbsp${message}</span>
    </div>`;

  const myMsg = `
  <div class="message_sent" id ="msg">
        <b><i class="fa fa-user-circle"></i> <span> ${
           "me"
        }</span> </b><br>
        <span >&nbsp &nbsp&nbsp&nbsp${message}</span>
    </div>`;

  messages.innerHTML =messages.innerHTML + (user === userName ? myMsg : receivedMsg);
  
});



peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id,user);
});

// CHAT

const connectToNewUser = (userId, streams) => {
  var call = peer.call(userId, streams);
  console.log(call);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log(userVideoStream);
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;

};
const connectToscreen = (userId, streams) => {
  var call = peer.call(userId, streams);
  console.log(streams);
  console.log(call);
  var video = document.createElement("video");
  call.on("stream", (screenTrack) => {
    console.log(screenTrack);
    //addVideoStream(video, screenTrack);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};


const addVideoStream = (videoEl, stream) => {
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();

  });

  videoGrid.append(videoEl);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
};

var screenTrack;
function shareScreen() {
  navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {

       screenTrack = stream;
       console.log("inthe sharescreen func");
       console.log(screenTrack);
      var video = document.createElement("video");
      addVideoStream(video, screenTrack);
      socket.emit("initiate");      
  })
}
let share = document.getElementById("screen");
share.addEventListener("click", (e) =>{
  console.log("Screen Shared-1"); 
  shareScreen();
  
});

socket.on("share-screen",() =>{
  console.log("Sharing  screen ");
  console.log(screenTrack);
  connectToscreen(myUserId,screenTrack);
  console.log("Sharing  screen ");
})

const exit = () => {
  window.location.href = "/exit";
};

const copyInfo = () => {
  navigator.clipboard.writeText(window.location.href);
};




const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
    
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html = `<i class="unmute fa fa-pause-circle"></i>
  <span class="unmute">Resume Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class=" fa fa-video-camera"></i>
  <span class="">Pause Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Unmute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>
  <span>Mute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};

const leave = () => {
  let want_to_leave = confirm("Are you sure you want to leave the meeting?");
  if(want_to_leave)
  {
    window.location.replace("/feedback");
  }
};

const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", (e) => {
  var mail_id=prompt("Enter mail id",""); 
    var link=window.location.href ;
    socket.emit("mail_sent",mail_id, link);

});

socket.on("success",()=>{
  console.log("success");
  //wait(5000);
  //prompt("Enter your name");
  setTimeout(() => {  console.log("World!");alert("message successfully sent!!"); }, 3000);
  
});


var buttons = document.getElementById("showChat");
buttons.addEventListener("click", (e) => {
  console.log("button isclicked");
  document.querySelector(".main__right").classList.toggle("click");
    document.querySelector(".main__left").classList.toggle("click");   

});

'use strict';

/* globals MediaRecorder */

let mediaRecorder;
let recordedBlobs;

const codecPreferences = document.querySelector('#codecPreferences');

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('#record');
const downloadButton = document.querySelector('button#download');

recordButton.addEventListener('click', () => {
  console.log("record start");
  recordButton.disabled = false;
  console.log('getUserMedia() got stream:', myVideoStream);
  window.stream = myVideoStream;

  const gumVideo = document.querySelector('#video-grid');
  gumVideo.srcObject = myVideoStream;

  getSupportedMimeTypes().forEach(mimeType => {
    const option = document.createElement('option');
    option.value = mimeType;
    option.innerText = option.value;
    codecPreferences.appendChild(option);
  });
  codecPreferences.disabled = false;

  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    
   // downloadButton.disabled = false;
    codecPreferences.disabled = false;
  }
  
});

function download(){
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function getSupportedMimeTypes() {
  const possibleTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/mp4;codecs=h264,aac',
  ];
  return possibleTypes.filter(mimeType => {
    return MediaRecorder.isTypeSupported(mimeType);
  });
}

function startRecording() {
  recordedBlobs = [];
  const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value;
  const options = {mimeType};

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';

 // downloadButton.disabled = true;
  codecPreferences.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
    download();
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
}
/*
'use strict';


function handleSuccess(stream) {
  startButton.disabled = true;
  const video = document.querySelector('video');
  video.srcObject = stream;

  // demonstrates how to detect that the user has stopped
  // sharing the screen via the browser UI.
  stream.getVideoTracks()[0].addEventListener('ended', () => {
    errorMsg('The user has ended sharing the screen');
    startButton.disabled = false;
  });
}

function handleError(error) {
  errorMsg(`getDisplayMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

const startButton = document.getElementById('record');
startButton.addEventListener('click', () => {
  navigator.mediaDevices.getDisplayMedia({video: true})
      .then(handleSuccess, handleError);
});

if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
  startButton.disabled = false;
} else {
  errorMsg('getDisplayMedia is not supported');
}
*/