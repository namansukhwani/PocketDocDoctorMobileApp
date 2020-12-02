import { Platform, ToastAndroid } from 'react-native';
import Toast from 'react-native-simple-toast';
import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';

class Call {
  static MEDIA_OPTIONS = {video: { width: 1280, height: 720 }, audio: true};

  _session = null;
  mediaDevices = [];

  outgoingCall = new Sound(require('../../assets/sounds/dialing.mp3'));
  incomingCall = new Sound(require('../../assets/sounds/calling.mp3'));
  endCall = new Sound(require('../../assets/sounds/end_call.mp3'));

  showToast = text => {
    Toast.showWithGravity(text, Toast.LONG,Toast.BOTTOM);
  };

  getUserById = (userId) => {
    const searchParams = { login: userId };

    return new Promise((resolve,reject)=>{
      ConnectyCube.users.get(searchParams)
      .then((result)=>{
        //console.log("Result :::",result);
        resolve(result.user.id.toString());
      })
      .catch(err=>{
        //console.log(err);
        reject(err);
      })
    })
    
  };

  getUser = (userId, key) => {
    //const user = users.find(user => user.id == userId);
    const searchParams={filter: {
      field: "id",
      param: "in",
      value: [userId],
    }}
    
    return new Promise((resolve,reject)=>{
      ConnectyCube.users.get(searchParams)
      .then((result)=>{
        //console.log("Result :::",result);
        const user=result.items[0].user;
        if (typeof key === 'string') {
          //console.log(user[key]);
          resolve(user[key]);
        }
    
        resolve(user);
      })
      .catch(err=>{
        reject(err)
      })
    })
  };

  setMediaDevices() {
    return ConnectyCube.videochat.getMediaDevices().then(mediaDevices => {
      //console.log(mediaDevices);
      this.mediaDevices = mediaDevices;
    });
  }

  acceptCall = session => {
    this.stopSounds();
    this._session = session;
    this.setMediaDevices();

    return new Promise((resolve,reject)=>{
      this._session
      .getUserMedia(Call.MEDIA_OPTIONS)
      .then(stream => {
        this._session.accept({});
        resolve(stream);
      })
      .catch((err)=>{reject(err);});
    })

  };

  startCall = (ids,extraData) => {
    const options = {};
    const type = ConnectyCube.videochat.CallType.VIDEO; // AUDIO is also possible

    this._session = ConnectyCube.videochat.createNewSession(ids, type, options);
    this.setMediaDevices();
    this.playSound('outgoing');

    return new Promise((resolve,reject)=>{ 
      this._session
      .getUserMedia(Call.MEDIA_OPTIONS)
      .then(stream => {
        this._session.call(extraData,err=>{reject(err),this.stopSounds();});
        resolve(stream);
      })
      .catch((err)=>{reject(err);this.stopSounds();});
    })
  };

  stopCall = () => {
    this.stopSounds();

    if (this._session) {
      this.playSound('end');
      this._session.stop({});
      ConnectyCube.videochat.clearSession(this._session.ID);
      this._session = null;
      this.mediaDevices = [];
    }
  };

  rejectCall = (session, extension={}) => {
    session.reject(extension);
    this.stopSounds();
  };

  setAudioMuteState = mute => {
    if (mute) {
      this._session.mute('audio');
    } else {
      this._session.unmute('audio');
    }
  };

  switchCamera = localStream => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  };

  setSpeakerphoneOn = flag => InCallManager.setSpeakerphoneOn(flag);

  processOnUserNotAnswerListener(userId) {
    return new Promise((resolve, reject) => {
      if (!this._session) {
        reject();
      } else {
        var userName;
        this.getUser(userId, 'full_name')
        .then(result=>userName=result)
        .catch(err=>console.log(err));
        const message = `${userName} did not answer`;

        this.showToast(message);

        resolve();
      }
    });
  }

  processOnCallListener(session) {
    return new Promise((resolve, reject) => {
      if (session.initiatorID === session.currentUserID) {
        reject();
      }

      else if (this._session) {
        this.rejectCall(session, { busy: true });
        reject();
      }
      else{
      this.playSound('incoming');

      resolve();
      }
    });
  }

  processOnAcceptCallListener(session, userId, extension = {}) {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this._session = null;
        this.showToast('You have accepted the call on other side');

        reject();
      } else {
        var userName;
        this.getUser(userId, 'full_name')
        .then(result=>userName=result)
        .catch(err=>console.log(err));
        const message = `${userName} has accepted the call`;

        this.showToast(message);
        this.stopSounds();

        resolve();
      }
    });
  }

  processOnRejectCallListener(session, userId, extension = {}) {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this._session = null;
        this.showToast('You have rejected the call');

        reject();
      } else {
        this.stopSounds();
        this.getUser(userId, 'full_name')
        .then(result=>{
          const message = extension.busy
          ? `${result} is busy`
          : `${result} rejected your call`;

          this.showToast(message);
        })
        .catch(err=>console.log(err));

        resolve();
      }
    });
  }

  processOnStopCallListener(userId, isInitiator) {
    return new Promise((resolve, reject) => {
      this.stopSounds();

      if (!this._session) {
        reject();
      } else {
        this.getUser(userId, 'full_name')
        .then(result=>{
          const message = `${result} has ${
          isInitiator ? 'stopped' : 'left'
          } the call`;

          this.showToast(message);

          resolve();
        })
        .catch(err=>reject(err));
        
      }
    });
  }

  processOnRemoteStreamListener = () => {
    return new Promise((resolve, reject) => {
      if (!this._session) {
        reject();
      } else {
        resolve();
      }
    });
  };

  playSound = type => {
    switch (type) {
      case 'outgoing':
        this.outgoingCall.setNumberOfLoops(-1);
        this.outgoingCall.play();
        break;
      case 'incoming':
        this.incomingCall.setNumberOfLoops(-1);
        this.incomingCall.play();
        break;
      case 'end':
        this.endCall.play();
        break;

      default:
        break;
    }
  };

  stopSounds = () => {
    if (this.incomingCall.isPlaying()) {
      this.incomingCall.pause();
    }
    if (this.outgoingCall.isPlaying()) {
      this.outgoingCall.pause();
    }
  };
}

export const CallService=new Call();