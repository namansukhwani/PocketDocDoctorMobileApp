import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, StyleSheet, View, TouchableOpacity, BackHandler, ToastAndroid,LayoutAnimation,UIManager,Platform } from 'react-native';
import { Headline, Button, Title, Avatar, IconButton, Paragraph } from 'react-native-paper';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import ConnectyCube,{RTCView} from 'react-native-connectycube';
import { CallService } from '../Services/videoCalling/CallService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarVideoCall from './VideoCallToolbar';
import LoadingScreen from './loadingScreen';
import { EventRegister } from 'react-native-event-listeners';
import InCallManager from 'react-native-incall-manager';

//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({

})



//Component
function VideoCall(props) {

    const navigation = useNavigation();
    var timer;
    var backTimer;
    
    //state
    const [session, setSession] = useState(null);
    const [incomingCall, setIncomingCall] = useState(false);
    const [outgoingCall, setOutgoingCall] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [showToolBar, setShowToolBar] = useState(false)
    const [mic, setMic] = useState(true);
    const [bottomHeight, setBottomHeight] = useState(20);

    const [localStream, setLocalStream] = useState(null);
    const [otherUserStream, setOtherUserStream] = useState(null);
    var backCount=0;
    //lifecycle
    useEffect(() => {
        checkCallType();
        setAllListners();
        showToolBarOnPress()
        //CallService.setSpeakerphoneOn(true);
        const backhandler = BackHandler.addEventListener("hardwareBackPress", () => {
            backCount === 1 ? endCall(): ToastAndroid.show('Press back again to End Call', ToastAndroid.SHORT);
            backCount=1
            backTimer=setTimeout(() => { backCount=0 }, 3000)
            //endCall();
            return true;
        })
        //console.log(props.user.user.name);
        const onRemoteStreamListener=EventRegister.addEventListener('onRemoteStreamListener',(data)=>{
            console.log("remote stream here.");
            _onRemoteStreamListener(data.session,data.userId,data.stream);
        });

        const onAcceptCallListener=EventRegister.addEventListener('onAcceptCallListener',(data)=>{
            _onAcceptCallListener(data.session,data.userId,data.extension);
        })

        const onUserNotAnswerListener=EventRegister.addEventListener('onUserNotAnswerListener',data=>{
            _onUserNotAnswerListener(data.session,data.userId);
        })

        return () => {
            backhandler.remove();
            clearTimeout(timer);
            clearTimeout(backTimer);
            EventRegister.removeEventListener(onRemoteStreamListener);
            EventRegister.removeEventListener(onAcceptCallListener)
            EventRegister.removeEventListener(onUserNotAnswerListener);
        }
    }, [])

    //method

    const checkCallType=()=>{
        if(props.route.params.type==="outgoing"){
            setLocalStream(props.route.params.localStream);
            setOutgoingCall(true);
        }
        else if(props.route.params.type==="incoming"){
            setSession(props.route.params.session);
            setIncomingCall(true)
        }
    }

    //call management functions

    const acceptIncomingCall=()=>{
        CallService.acceptCall(session)
        .then(localStream=>{
            setLocalStream(localStream);
            // CallService.setSpeakerphoneOn(true);
            InCallManager.start({media:'video'})
            .then(()=>{
                InCallManager.setKeepScreenOn(true);
                InCallManager.setForceSpeakerphoneOn(true);
                InCallManager.chooseAudioRoute('SPEAKER_PHONE');
            });
        })
        .catch(err=>console.log(err));
    };

    const rejectIncomingCall=()=>{
        CallService.rejectCall(session);
        navigation.goBack();
    }

    const stopCall=()=>{
        InCallManager.stop();
        CallService.stopCall();
        navigation.goBack();
    }

    const micOnOff = () => {
        CallService.setAudioMuteState(mic);
        setMic(!mic);
    }

    const endCall = () => {
        if(inCall){
            stopCall();
        }
        else if(props.route.params.type==="outgoing"){
            stopCall();
        }
        else if(props.route.params.type==="incoming"){
            CallService.rejectCall(props.route.params.session);
            navigation.goBack();
        }
        // else{CallService.stopSounds();
        // CallService.playSound('end');
        // navigation.goBack();}
    };

    const switchCamera = () => {
        CallService.switchCamera(localStream);
    };

    //other methods

    const setAllListners=()=>{
        ConnectyCube.videochat.onRejectCallListener = (session, userId, extension)=>{_onRejectCall(session,userId,extension)};
        ConnectyCube.videochat.onStopCallListener = (session, userId, extension) =>{_onStopCallListener(session,userId,extension)};
    }

    const _onUserNotAnswerListener = (session, userId) =>{
        //console.log("USER NOT ACCEPTING YOU CALL");
        const toast=props.route.params.data.userName+" didn't answered your call";
        ToastAndroid.show(toast,ToastAndroid.LONG);
        stopCall();
    }

    const _onAcceptCallListener = (session, userId, extension) =>{
        CallService.stopSounds();
        InCallManager.start({media:'video'})
        InCallManager.setKeepScreenOn(true);
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.chooseAudioRoute('SPEAKER_PHONE');
        setOutgoingCall(false);
    }

    const  _onStopCallListener = (session, userId, extension) => {
        stopCall();
    }

    const _onRemoteStreamListener=(session, userId, stream) => {
        // console.log("remote stream  !!!");
        // console.log("this is a remote stream :::::::",stream);
        CallService.processOnRemoteStreamListener()
        .then(()=>{
            setOtherUserStream(stream);
            setIncomingCall(false);
            setInCall(true);
        });
    }

    const _onRejectCall=(session, userId, extension)=>{
        CallService.processOnRejectCallListener(session, userId, extension)
        .then(()=>{
            stopCall();
        })
        .catch(err=>console.log(err))
    }

    const showToolBarOnPress = () => {

        setShowToolBar(true);
        setBottomHeight(90);
        timer = setTimeout(() => {
            setShowToolBar(false)
            setBottomHeight(20);
        }, 7000)
    }

    if (incomingCall) {
        return (
            <View style={{ flex: 1, backgroundColor: '#e3f2fd' }}>
                <StatusBar backgroundColor="#e3f2fd" barStyle="dark-content" />
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Headline style={{ alignSelf: "center", margin: 15 }} >Incoming Call</Headline>
                    <MaterialCommunityIcons style={{ alignSelf: 'center' }} name="phone-incoming" color="#008000" size={25} />
                </View>
                <View style={styles.icomingCircle} >
                    <Animatable.View style={{ alignSelf: 'center', }} animation="pulse" easing="ease-out" iterationCount="infinite" duration={860}>
                        {props.route.params.dataIncoming.profilePic === '' ?
                            <Avatar.Text style={{ alignSelf: 'center', elevation: 10 }} theme={{ colors: { primary: '#147efb' } }} size={140} label={props.route.params.dataIncoming.name.split(' ')[1][0] + props.route.params.dataIncoming.name.split(' ')[2][0]} />
                            :
                            <Avatar.Image source={{ uri: props.route.params.dataIncoming.profilePic }} style={{ elevation: 10, alignSelf: 'center', }} theme={{ colors: { primary: '#147efb' } }} size={140} />
                        }
                    </Animatable.View>
                </View>
                <Title style={{ alignSelf: 'center', fontSize: 28 }}>{props.route.params.dataIncoming.name}</Title>


                <View style={styles.incomingCallFooter}>
                    <View style={{ flex: 1, alignSelf: 'center', justifyContent: "center", alignItems: 'center' }}>
                        <IconButton
                            icon="phone"
                            style={{ backgroundColor: '#008000' }}
                            size={50}
                            color='#fff'
                            onPress={() => acceptIncomingCall()}
                        />
                        <Paragraph>Accept</Paragraph>
                    </View>
                    <View style={{ flex: 1, alignSelf: 'center', justifyContent: "center", alignItems: 'center' }}>
                        <IconButton
                            icon="phone-hangup"
                            style={{ backgroundColor: '#FF0000' }}
                            size={50}
                            color='#fff'
                            onPress={() => {
                                rejectIncomingCall()
                            }}
                        />
                        <Paragraph>Decline</Paragraph>
                    </View>
                </View>
            </View>
        );
    }
    else if (outgoingCall) {
        return (
            <View style={{ flex: 1, backgroundColor: '#e3f2fd' }}>
                <StatusBar backgroundColor="#e3f2fd" barStyle="dark-content" />
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Headline style={{ alignSelf: "center", margin: 15 }} >Outgoing Call</Headline>
                    <MaterialCommunityIcons style={{ alignSelf: 'center' }} name="phone-outgoing" color="#008000" size={25} />
                </View>
                <View style={styles.icomingCircle}>
                    <Animatable.View style={{ alignSelf: 'center', }} animation="tada" easing="ease-out" iterationCount='infinite' duration={2000}>
                        {props.route.params.data.userProfilePicUrl === '' ?
                            <Avatar.Text style={{ alignSelf: 'center', elevation: 10 }} theme={{ colors: { primary: '#147efb' } }} size={140} label={props.route.params.data.userName.split(' ')[0][0] + props.route.params.data.userName.split(' ')[1][0]} />
                            :
                            <Avatar.Image source={{ uri: props.route.params.data.userProfilePicUrl }} style={{ elevation: 10, alignSelf: 'center', }} theme={{ colors: { primary: '#147efb' } }} size={140} />
                        }
                    </Animatable.View>
                </View>
                <Paragraph style={{ alignSelf: "center", fontSize: 18 }}>Ringing...</Paragraph>
                <Title style={{ alignSelf: 'center', fontSize: 28 }}>{props.route.params.data.userName}</Title>


                <View style={styles.incomingCallFooter}>
                    <View style={{ flex: 1, alignSelf: 'center', justifyContent: "center", alignItems: 'center' }}>
                        <IconButton
                            icon="phone-hangup"
                            style={{ backgroundColor: '#FF0000' }}
                            size={50}
                            color='#fff'
                            onPress={() => {
                                stopCall();
                            }}
                        />
                        <Paragraph>End Call</Paragraph>
                    </View>
                </View>
            </View>
        );
    }
    else if (inCall) {
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => showToolBarOnPress()} style={{ flex: 1, backgroundColor: '#000' }}>
                <StatusBar backgroundColor="#000" barStyle="light-content" />
                <View style={{flex:1,backgroundColor:'#000',borderRadius:20,overflow:'hidden'}}>
                <RTCView
                    objectFit="cover"
                    style={{flex:1,backgroundColor:'#000',}}
                    key='otherUser'
                    streamURL={otherUserStream.toURL()}
                />
                </View>
                <View style={{...styles.localStream,bottom:bottomHeight}}>
                <RTCView
                    objectFit="cover"
                    style={{flex:1,backgroundColor:'#000'}}
                    key='localStream'
                    streamURL={localStream.toURL()}
                    zOrder={-10}
                />
                </View>
                <ToolBarVideoCall visible={showToolBar} endCall={() => stopCall()} switchCamera={() => switchCamera()} micOnOff={() => micOnOff()} mic={mic} />
            </TouchableOpacity>
        );
    }
    else {
        return (<><LoadingScreen backgroundColor="#000" color="#147EFB"/></>);
    }


}

const styles = StyleSheet.create({
    incomingCallFooter: {
        position: 'absolute',
        bottom: 0,
        right: 10,
        left: 10,
        height: 200,
        flexDirection: "row",
        justifyContent: 'space-evenly'
    },
    icomingCircle: {
        backgroundColor: '#147efb50',
        width: 220,
        height: 220,
        alignSelf: 'center',
        borderRadius: 110,
        marginVertical: 20,
        justifyContent: 'center'
    },
    localStream:{
        backgroundColor:'#000',
        position:'absolute',
        width:90,
        height:160,
        borderRadius:10,
        right:20,
        overflow:'hidden',
        elevation:10,
        zIndex:10
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoCall);