let peerConnection = new RTCPeerConnection()
let localStream;
let remoteStream;

const baseApi = 'https://thefcraft.pythonanywhere.com';

let init = async (roomId) => {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    remoteStream = new MediaStream()
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
        });
    };

    const roomUrl = `${baseApi}/room`;
    fetch(roomUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ID: roomId,
          // Optional: Add 'data' and 'delete' fields as needed
          // data: 'hello',
          // delete: true
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Room interaction result:', data);
        const value = data['Data'];
        let offer = null;
        let vtype = null;
        try {
            offer = JSON.parse(value);
            vtype = offer['type'];
            console.log(vtype);
        }catch(err) {
            offer = null;
        }
        if (offer!=null && value!=null){
            console.log('Room interaction result:', value);
            createAnswer(roomId, offer);
        }else{
            console.log('new room creating');
            createOffer(roomId);
            addAnswer(roomId);
        }
        
      })
      .catch(error => console.error('Error interacting with room:', error));
};

let createOffer = async (roomId) => {
    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
        if(event.candidate){
            const roomUrl = `${baseApi}/room`;
            fetch(roomUrl, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                ID: roomId,
                data: JSON.stringify(peerConnection.localDescription),
                // delete: true
                })
              })
              .then(response => response.json())
              .catch(error => console.error('Error interacting with room:', error));
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
};

let createAnswer = async (roomId, offer) => {
    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new answer ICE candidate is created
        if(event.candidate){
            console.log('Adding answer candidate...:', event.candidate)
            const roomUrl = `${baseApi}/room`;
            fetch(roomUrl, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                ID: roomId,
                data: JSON.stringify(peerConnection.localDescription),
                // delete: true
                })
              })
              .then(response => response.json())
              .catch(error => console.error('Error interacting with room:', error));
        }
    };

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer); 
};

let addAnswer = async (roomId) => {
    // answer
    try {
        console.log('Add answer triggerd')

        // Make the API call
        const roomUrl = `${baseApi}/room`;
        const response = await fetch(roomUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ID: roomId
            })
        });
        // Handle the response
        const data = await response.json();
        const value = data['Data'];
        let offer = null;
        let vtype = null;
        try {
            offer = JSON.parse(value);
            vtype = offer['type'];
            console.log('vtype:', vtype);
        } catch (err) {
            offer = null;
        }
        if (vtype === 'answer') {
            console.log('vtype is answer...');
            let answer = offer;
            console.log('answer:', answer)

            fetch(roomUrl, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                ID: roomId,
                delete: true
                })
              })
              .then(response => response.json())
              .catch(error => console.error('Error interacting with room:', error));
              
            if (!peerConnection.currentRemoteDescription){
                peerConnection.setRemoteDescription(answer);
            }
        }else{
            // Optional: Perform actions based on vtype or offer
            // Delay for 5 seconds before making the next API call
            setTimeout(() => {
                addAnswer(roomId);
            }, 2000);
        }
        console.log('vtype is not answer, stopping...');
    } catch (error) {
        console.error('Error interacting with room:', error);
    }
};

// init()

// document.getElementById('create-offer').addEventListener('click', createOffer)
// document.getElementById('create-answer').addEventListener('click', createAnswer)
// document.getElementById('add-answer').addEventListener('click', addAnswer)