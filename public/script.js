


const socket = io("/");
//const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
//
//const showChat = document.querySelector("#showChat");
//const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
var myUserId="";
//


//
/*



backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});
*/
const peers={};
const user_list=[];
const user = prompt("Enter your name");
if(user.trim().length ==0){
  document.write("Enter the username is mandatory to create a room  ");
  
}

//const user = prompt("Enter your name");
user_list.push(user);
console.log(user_list);

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
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
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="fa fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
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
/*
const connectToScreen = (streams) => {
  console.log(streams);
  var video = document.createElement("video");
  addVideoStream(video, streams);
*/




  /*
  var call = peer.call( streams);
  console.log(call);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log(userVideoStream);
    addVideoStream(video, userVideoStream);
  });
  
  call.on("close",()=>{
    video.remove();
  });
  peers[userId]=call;
  
};
*/

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
/*
function shareScreen () {
  let captureStream = null;


  try {
    captureStream =  navigator.mediaDevices.getDisplayMedia();
  } catch (err) {
    console.error("Error: " + err);
  }
  // connectToNewUser(myUserId, captureStream);
  peer.call( captureStream);
};
*/
var screenTrack;
function shareScreen() {
  navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {

       screenTrack = stream;
       console.log("inthe sharescreen func");
       console.log(screenTrack);
      var video = document.createElement("video");
      addVideoStream(video, screenTrack);
      socket.emit("initiate");
     //socket.emit("initiate",stream);
      //peer.call( screenTrack);
      /*
      peer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
  
        call.on("stream", (screenTrack) => {
          addVideoStream(video, screenTrack);
        });
      */
        //socket.emit("initiate");
      //socket.on("initiate");
      /*
      call.on("stream", (screenTrack) => {
        addVideoStream(video, screenTrack);
      });*/
      
  })
}
let share = document.getElementById("screen");
share.addEventListener("click", (e) =>{
  console.log("Screen Shared-1"); 
  shareScreen();
  
});
/*
socket.on("share-screen",() =>{
  console.log("Sharing  screen ");
  console.log(screenTrack);
  var video = document.createElement("video");
  addVideoStream(video, screenTrack);
  console.log("Sharing  screen ");
})*/

socket.on("share-screen",() =>{
  console.log("Sharing  screen ");
  console.log(screenTrack);
  connectToscreen(myUserId,screenTrack);
  console.log("Sharing  screen ");
})


/*
socket.on("share-screen",(screenTrack) =>{
  console.log("Sharing  screen ");
  console.log(screenTrack);
  var video = document.createElement("video");
  addVideoStream(video, screenTrack);
  console.log("Sharing  screen ");
})

*/
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


/*
const showInvitePopup=() =>{
  document.body.classList.toggle("showInvite");
  document.getElementById("roomLink").value = window.location.href;
}
*/

const inviteButton = document.querySelector("#inviteButton");
inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});
/*
const showChat = document.querySelector("#showChat");
const ShowChat=(e)=>{
  e.classList.toggle("active");
  document.body.classList.toggle("showChat");
};*/
/*
function showChat(){
  document.getElementById("showChat").style.display="block";
}
*/
/*  come to full screen

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});*/
/*

function closeCurrentTab(){
  var conf=confirm("Are you sure, you want to close this tab?");
  if(conf==true){
    window.close();
  }
}


window.addEventListener( 'load', () => {
  //When the chat icon is clicked
  document.querySelector( '#showChat' ).addEventListener( 'click', ( e ) => {
      let chatElem = document.querySelector( 'main__right' );
      let mainSecElem = document.querySelector( 'main__left' );

      if ( chatElem.classList.contains( 'chat-opened' ) ) {
          chatElem.setAttribute( 'hidden', true );
          mainSecElem.classList.remove( 'col-md-9' );
          mainSecElem.classList.add( 'col-md-12' );
          chatElem.classList.remove( 'chat-opened' );
      }

      else {
          chatElem.attributes.removeNamedItem( 'hidden' );
          mainSecElem.classList.remove( 'col-md-12' );
          mainSecElem.classList.add( 'col-md-9' );
          chatElem.classList.add( 'chat-opened' );
      }
} )});

*/
///print all users
/*
function shareScreen() {
  h.shareScreen().then( ( stream ) => {
      h.toggleShareIcons( true );

      //disable the video toggle btns while sharing screen. This is to ensure clicking on the btn does not interfere with the screen sharing
      //It will be enabled was user stopped sharing screen
      h.toggleVideoBtnDisabled( true );

      //save my screen stream
      screen = stream;

      //share the new stream with all partners
      broadcastNewTracks( stream, 'video', false );

      //When the stop sharing button shown by the browser is clicked
      screen.getVideoTracks()[0].addEventListener( 'ended', () => {
          stopSharingScreen();
      } );
  } ).catch( ( e ) => {
      console.error( e );
  } );
}

function stopSharingScreen() {
  //enable video toggle btn
  h.toggleVideoBtnDisabled( false );

  return new Promise( ( res, rej ) => {
      screen.getTracks().length ? screen.getTracks().forEach( track => track.stop() ) : '';

      res();
  } ).then( () => {
      h.toggleShareIcons( false );
      broadcastNewTracks( myStream, 'video' );
  } ).catch( ( e ) => {
      console.error( e );
  } );
}
*/

///////////// record
/*
let shouldStop = false;
    let stopped = false;
    const downloadLink = document.getElementById('download');
    const stopButton = document.getElementById('stop');
    function startRecord() {
        $('.btn-info').prop('disabled', true);
        $('#stop').prop('disabled', false);
        $('#download').css('display', 'none')
    }
    function stopRecord() {
        $('.btn-info').prop('disabled', false);
        $('#stop').prop('disabled', true);
        $('#download').css('display', 'block')
    }
    stopButton.addEventListener('click', function () {
      shouldStop = true;
  });


const handleRecord = function ({stream, mimeType}) {
  startRecord()
  // to collect stream chunks
  let recordedChunks = [];
  stopped = false;
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
    // shouldStop => forceStop by user
    if (shouldStop === true && stopped === false) {
      mediaRecorder.stop();
      stopped = true;
    }
  };
  mediaRecorder.onstop = function () {
    const blob = new Blob(recordedChunks, {
      type: mimeType
    });
    recordedChunks = []
    const filename = window.prompt('Enter file name'); // input filename from user for download
    downloadLink.href = URL.createObjectURL(blob); // create download link for the file
    downloadLink.download = `${filename}.webm`; // naming the file with user provided name
    stopRecord();
    videoElement.srcObject = null;
  };
  mediaRecorder.start(200);
}

async function recordScreen() {
  const mimeType = 'video/webm';
  shouldStop = false;
  const constraints = {
    video: {cursor: 'motion'}
  };
  if(!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
    return window.alert('Screen Record not supported!')
}
let stream = null;
  const displayStream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});
  // voiceStream for recording voice with screen recording
  if(window.confirm("Record audio with screen?")){
  const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  let tracks = [...displayStream.getTracks(), ...voiceStream.getAudioTracks()]
   stream = new MediaStream(tracks);
  handleRecord({stream, mimeType})
}
else {
  stream = displayStream;
  handleRecord({stream, mimeType});
};
videoElement.srcObject = stream;
}





var recordedStream = [];
var mediaRecorder = '';

function toggleRecordingIcons( isRecording ) {
  let e = document.getElementById( 'record' );

  if ( isRecording ) {
      e.setAttribute( 'title', 'Stop recording' );
      e.children[0].classList.add( 'text-danger' );
      e.children[0].classList.remove( 'text-white' );
  }

  else {
      e.setAttribute( 'title', 'Record' );
      e.children[0].classList.add( 'text-white' );
      e.children[0].classList.remove( 'text-danger' );
  }
}

function startRecording( stream ) {
  mediaRecorder = new MediaRecorder( stream, {
      mimeType: 'video/webm;codecs=vp9'
  } );

  mediaRecorder.start( 1000 );
  toggleRecordingIcons( true );

  mediaRecorder.ondataavailable = function ( e ) {
      recordedStream.push( e.data );
  };

  mediaRecorder.onstop = function () {
      toggleRecordingIcons( false );

      h.saveRecordedStream( recordedStream, username );

      setTimeout( () => {
          recordedStream = [];
      }, 3000 );
  };

  mediaRecorder.onerror = function ( e ) {
      console.error( e );
  };
}

document.getElementById( 'share-screen' ).addEventListener( 'click', ( e ) => {
  e.preventDefault();

  if ( screen && screen.getVideoTracks().length && screen.getVideoTracks()[0].readyState != 'ended' ) {
      stopSharingScreen();
  }

  else {
      shareScreen();
  }
} );


document.getElementById( 'record' ).addEventListener( 'click', ( e ) => {
  /**
   * Ask user what they want to record.
   * Get the stream based on selection and start recording
   */
  /*
  if ( !mediaRecorder || mediaRecorder.state == 'inactive' ) {
      h.toggleModal( 'recording-options-modal', true );
  }

  else if ( mediaRecorder.state == 'paused' ) {
      mediaRecorder.resume();
  }

  else if ( mediaRecorder.state == 'recording' ) {
      mediaRecorder.stop();
  }
});


//When user choose to record screen
  document.getElementById( 'record-screen' ).addEventListener( 'click', () => {
    h.toggleModal( 'recording-options-modal', false );

    if ( screen && screen.getVideoTracks().length ) {
        startRecording( screen );
    }

    else {
        h.shareScreen().then( ( screenStream ) => {
            startRecording( screenStream );
        } ).catch( () => { } );
    }
  } );


//When user choose to record own video
document.getElementById( 'record-video' ).addEventListener( 'click', () => {
  h.toggleModal( 'recording-options-modal', false );

  if ( myStream && myStream.getTracks().length ) {
      startRecording( myStream );
  }

  else {
      h.getUserFullMedia().then( ( videoStream ) => {
          startRecording( videoStream );
      } ).catch( () => { } );
  }
});
}};
*/
/*
const stunServerConfig = {
  iceServers: [{
    url: 'turn:13.250.13.83:3478?transport=udp',
    username: "YzYNCouZM1mhqhmseWk6",
    credential: "YzYNCouZM1mhqhmseWk6"
  }]
};



var initiateBtn = document.getElementById('initiateBtn');
var stopBtn = document.getElementById('stopBtn');
var initiator = false;



initiateBtn.onclick = (e) => {
  console.log("Screen Shared");
  initiator = true;
  socket.emit('initiate');
}

stopBtn.onclick = (e) => {
  socket.emit('initiate');
}

socket.on('initiate', () => {
  startStream();
  initiateBtn.style.display = 'none';
  stopBtn.style.display = 'block';
})

function startStream () {
  if (initiator) {
    // get screen stream
    navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: "screen",
        width: { max: '1920' },
        height: { max: '1080' },
        frameRate: { max: '10' }
      }
    }).then(gotMedia);
  } else {
    gotMedia(null);
  }
}

function gotMedia (stream) {
  if (initiator) {
    var peer = new Peer({
      initiator,
      stream,
      config: stunServerConfig
    });
  } else {
    var peer = new Peer({
      config: stunServerConfig
    });
  }

  peer.on('signal', function (data) {
    socket.emit('offer', JSON.stringify(data));
  });

  socket.on('offer', (data) => {
    peer.signal(JSON.parse(data));
  })

  peer.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video');
    video.srcObject = stream;
    video.play();
  })
}
*/


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
/*
const playButton = document.querySelector('button#play');
playButton.addEventListener('click', () => {
  const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value.split(';', 1)[0];
  const superBuffer = new Blob(recordedBlobs, {type: mimeType});
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});*/
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
downloadButton.addEventListener('click', () => {
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
});

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
function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  const gumVideo = document.querySelector('#video-grid');
  gumVideo.srcObject = stream;

  getSupportedMimeTypes().forEach(mimeType => {
    const option = document.createElement('option');
    option.value = mimeType;
    option.innerText = option.value;
    codecPreferences.appendChild(option);
  });
  codecPreferences.disabled = false;
}

async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}


document.querySelector('button#record').addEventListener('click', async () => {
  document.querySelector('button#record').disabled = true;
  //const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
  const constraints = {
    audio: {
      //echoCancellation: {exact: hasEchoCancellation}
    },
    video: {
      width: 1280, height: 720
    }
  };
  console.log('Using media constraints:', constraints);
  await init(constraints);
});
*/


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

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
  navigator.mediaDevices.getDisplayMedia({video: true})
      .then(handleSuccess, handleError);
});

if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
  startButton.disabled = false;
} else {
  errorMsg('getDisplayMedia is not supported');
}


