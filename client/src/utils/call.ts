const startBtn = document.getElementById("startBtn") as HTMLButtonElement;
const callBtn = document.getElementById("callBtn") as HTMLButtonElement;
const hangupBtn = document.getElementById("hangupBtn") as HTMLButtonElement;
const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;

let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;
let pc1: RTCPeerConnection | null = null;
let pc2: RTCPeerConnection | null = null;

export function setupCallUI() {
  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  startBtn.onclick = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = localStream;
    callBtn.disabled = false;
  };

  callBtn.onclick = async () => {
    callBtn.disabled = true;
    hangupBtn.disabled = false;

    pc1 = new RTCPeerConnection(servers);
    pc2 = new RTCPeerConnection(servers);

    // Exchange ICE candidates
    pc1.onicecandidate = (e) => pc2?.addIceCandidate(e.candidate ?? undefined);
    pc2.onicecandidate = (e) => pc1?.addIceCandidate(e.candidate ?? undefined);

    // Display remote stream
    pc2.ontrack = (e) => {
      if (!remoteStream) {
        remoteStream = new MediaStream();
        remoteVideo.srcObject = remoteStream;
      }
      remoteStream.addTrack(e.track);
    };

    // Add local stream tracks
    if (localStream && pc1) {
      localStream
        .getTracks()
        .forEach((track: MediaStreamTrack) => pc1!.addTrack(track, localStream!));
    }

    const offer = await pc1.createOffer();
    await pc1.setLocalDescription(offer);
    if (pc1.localDescription) await pc2.setRemoteDescription(pc1.localDescription);

    const answer = await pc2.createAnswer();
    await pc2.setLocalDescription(answer);
    if (pc2.localDescription) await pc1.setRemoteDescription(pc2.localDescription);
  };

  hangupBtn.onclick = () => {
    pc1?.close();
    pc2?.close();
    pc1 = null;
    pc2 = null;
    hangupBtn.disabled = true;
    callBtn.disabled = false;
    remoteVideo.srcObject = null;
  };
}
