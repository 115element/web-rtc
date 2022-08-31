//�˵����
let rtcPeerConnection;

//������Ƶ��
let localMediaStream = null;

//ice��������Ϣ, ���ڴ��� SDP ����
let iceServers = {
  "iceServers": [
    // {"url": "stun:stun.l.google.com:19302"},
    {"urls": ["stun:159.75.239.36:3478"]},
    {"urls": ["turn:159.75.239.36:3478"], "username": "chr", "credential": "123456"},
  ]
};

// ��������Ƶ��Ϣ, ���� �򿪱�������Ƶ��
const mediaConstraints = {
  video: {width: 500, height: 300},
  audio: true //����û����˷磬�������������Ƶ���ᱨ����������Ӱ����Ƶ������
};

// ���� offer ����Ϣ
const offerOptions = {
  iceRestart: true,
  offerToReceiveAudio: true, //����û����˷磬�������������Ƶ���ᱨ����������Ӱ����Ƶ������
};
// 1���򿪱�������Ƶ��
const openLocalMedia = (callback) => {
  console.log('�򿪱�����Ƶ��');
  navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then(stream => {
      localMediaStream = stream;
      //�� ����Ƶ�� ��ӵ� �˵� ��
      for (const track of localMediaStream.getTracks()) {
        rtcPeerConnection.addTrack(track, localMediaStream);
      }
      callback(localMediaStream);
    })
}
// 2������ PeerConnection ����
const createPeerConnection = () => {
  rtcPeerConnection = new RTCPeerConnection(iceServers);
}
// 3���������� offer �� SDP ����
const createOffer = (callback) => {
  // ����PeerConnection�� CreateOffer ��������һ������ offer��SDP����SDP�����б��浱ǰ����Ƶ����ز�����
  rtcPeerConnection.createOffer(offerOptions)
    .then(sdp => {
      // �����Լ��� SDP ����
      rtcPeerConnection.setLocalDescription(sdp)
        .then(() => callback(sdp));
    })
    .catch(() => console.log('createOffer ʧ��'));
}
// 4���������� answer �� SDP ����
const createAnswer = (callback) => {
  // ����PeerConnection�� CreateAnswer ��������һ�� answer��SDP����
  rtcPeerConnection.createAnswer(offerOptions)
    .then(sdp => {
      // �����Լ��� SDP ����
      rtcPeerConnection.setLocalDescription(sdp)
        .then(() => callback(sdp));
    })
    .catch(() => console.log('createAnswer ʧ��'))
}
// 5������Զ�̵� SDP ����
const saveSdp = (answerSdp, callback) => {
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp))
    .then(callback);
}
// 6������ candidate ��Ϣ
const saveIceCandidate = (candidate) => {
  let iceCandidate = new RTCIceCandidate(candidate);
  rtcPeerConnection.addIceCandidate(iceCandidate)
    .then(() => console.log('addIceCandidate �ɹ�'));
}
// 7���ռ� candidate �Ļص�
const bindOnIceCandidate = (callback) => {
  // �� �ռ� candidate �Ļص�
  rtcPeerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      callback(event.candidate);
    }
  };
};
// 8����� Զ����Ƶ�� �Ļص�
const bindOnTrack = (callback) => {
  rtcPeerConnection.ontrack = (event) => callback(event.streams[0]);
};
