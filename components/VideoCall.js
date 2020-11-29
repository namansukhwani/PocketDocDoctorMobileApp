import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, StyleSheet, View, TouchableOpacity, BackHandler, ToastAndroid } from 'react-native';
import { Headline, Button, Title, Avatar, IconButton, Paragraph } from 'react-native-paper';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import ConnectyCube from 'react-native-connectycube';
import { CallService } from '../Services/videoCalling/CallService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarVideoCall from './VideoCallToolbar';
import LoadingScreen from './loadingScreen';

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
    const [incomingCall, setIncomingCall] = useState(false);
    const [outgoingCall, setOutgoingCall] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [showToolBar, setShowToolBar] = useState(false)
    const [mic, setMic] = useState(true);

    var backCount=0;
    //lifecycle
    useEffect(() => {
        checkCallType();
        showToolBarOnPress()
        const backhandler = BackHandler.addEventListener("hardwareBackPress", () => {
            backCount === 1 ? endCall(): ToastAndroid.show('Press back again to End Call', ToastAndroid.SHORT);
            backCount=1
            backTimer=setTimeout(() => { backCount=0 }, 3000)
            //endCall();
            return true;
        })
        //console.log(props.user.user.name);

        return () => {
            backhandler.remove();
            clearTimeout(timer);
            clearTimeout(backTimer);
        }
    }, [])

    // useFocusEffect(

    //     useCallback(() => {
    //         var backTimer;
    //         const backhandler = BackHandler.addEventListener("hardwareBackPress", () => {
    //             backCount === 0 ? ToastAndroid.show('Press back to End Call', ToastAndroid.SHORT) : endCall();
    //             setBackCount(1);
    //             backTimer = setTimeout(() => { setBackCount(0) }, 3000)
    //             return true;
    //         })

    //         return () => {
    //             backhandler.remove();
    //             clearTimeout(backTimer)
    //         }
    //     }, [])
    // );

    //method

    const checkCallType=()=>{
        if(props.route.params.type==="outgoing"){
            setOutgoingCall(true);
        }
        else if(props.route.params.type==="incoming"){
            setIncomingCall(true)
        }
    }

    const showToolBarOnPress = () => {

        setShowToolBar(true);
        timer = setTimeout(() => {
            setShowToolBar(false)
        }, 7000)
    }

    const micOnOff = () => {
        setMic(!mic);
    }

    const endCall = () => {
        CallService.stopSounds();
        CallService.playSound('end');
        navigation.goBack();
    };

    const switchCamera = () => {

    };

    const name = 'Dr. Nitesh Sukhwani'
    const ava = ''
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
                        {ava === '' ?
                            <Avatar.Text style={{ alignSelf: 'center', elevation: 10 }} theme={{ colors: { primary: '#147efb' } }} size={140} label={name.split(' ')[1][0] + name.split(' ')[2][0]} />
                            :
                            <Avatar.Image source={{ uri: ava }} style={{ elevation: 10, alignSelf: 'center', }} theme={{ colors: { primary: '#147efb' } }} size={140} />
                        }
                    </Animatable.View>
                </View>
                <Title style={{ alignSelf: 'center', fontSize: 28 }}>{name}</Title>


                <View style={styles.incomingCallFooter}>
                    <View style={{ flex: 1, alignSelf: 'center', justifyContent: "center", alignItems: 'center' }}>
                        <IconButton
                            icon="phone"
                            style={{ backgroundColor: '#008000' }}
                            size={50}
                            color='#fff'
                            onPress={() => console.log("pick")}
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
                                endCall()
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
                                endCall()
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
                <ToolBarVideoCall visible={showToolBar} endCall={() => endCall()} switchCamera={() => switchCamera()} micOnOff={() => micOnOff()} mic={mic} />
            </TouchableOpacity>
        );
    }
    else {
        return (<><LoadingScreen backgroundColor="#fff" color="#147EFB"/></>);
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
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoCall);