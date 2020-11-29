import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StatusBar, BackHandler, ToastAndroid, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Headline, Button, IconButton, List, Modal, Subheading,Title,Avatar,Paragraph } from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { ChatHeader } from '../utility/ViewUtility';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import { } from '../redux/ActionCreators';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
// import Video from 'react-native-video';
import storage from '@react-native-firebase/storage';
import LoadingScreen from './loadingScreen';
import Spinner from 'react-native-spinkit';
import { AuthService } from '../Services/videoCalling/AuthService';
import { CallService } from '../Services/videoCalling/CallService';

//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({

})


//component
function Chat(props) {

    //values
    const [messages, setMessages] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [videoCallVisible, setVideoCallVisible] = useState(false);
    const [callLoading, setCallLoading] = useState(false);

    //lifecycles

    useFocusEffect(
        useCallback(() => {
            const backhandler = BackHandler.addEventListener("hardwareBackPress", () => {
                backAction();
                return true;
            })

            return () => {
                backhandler.remove();
            }
        }, [])
    );

    useEffect(() => {
        const unsubscribe = firestore().collection("chatRooms").doc(props.route.params.data.roomId).collection("messages")
            .orderBy('createdDate', 'desc')
            .onSnapshot(querySnapshot => {
                const threads = querySnapshot.docChanges().map(documentSnapshot => {
                    const message = documentSnapshot.doc.data()
                    if (message.type === 'text') {
                        return {
                            _id: documentSnapshot.doc.id,
                            text: message.body,
                            createdAt: message.createdDate.toDate(),
                            user: message.senderId === props.doctor.doctor.doctorId ?
                                {
                                    _id: message.senderId,
                                    name: props.doctor.doctor.name,
                                    avatar: props.doctor.doctor.profilePictureUrl
                                }
                                :
                                {
                                    _id: message.senderId,
                                    name: props.route.params.data.userName,
                                    avatar: props.route.params.data.userProfilePicUrl
                                },
                            sent: true,
                            received: message.status

                        }
                    }
                    else if (message.type === 'image') {
                        return {
                            _id: documentSnapshot.doc.id,
                            text: message.body,
                            createdAt: message.createdDate.toDate(),
                            user: message.senderId === props.doctor.doctor.doctorId ?
                                {
                                    _id: message.senderId,
                                    name: props.doctor.doctor.name,
                                    avatar: props.doctor.doctor.profilePictureUrl
                                }
                                :
                                {
                                    _id: message.senderId,
                                    name: props.route.params.data.userName,
                                    avatar: props.route.params.data.userProfilePicUrl
                                },
                            sent: true,
                            received: message.status,
                            image: message.mediaUrl
                        }
                    }
                    else if (message.type === 'video') {
                        return {
                            _id: documentSnapshot.doc.id,
                            text: message.body,
                            createdAt: message.createdDate.toDate(),
                            user: message.senderId === props.doctor.doctor.doctorId ?
                                {
                                    _id: message.senderId,
                                    name: props.doctor.doctor.name,
                                    avatar: props.doctor.doctor.profilePictureUrl
                                }
                                :
                                {
                                    _id: message.senderId,
                                    name: props.route.params.data.userName,
                                    avatar: props.route.params.data.userProfilePicUrl
                                },
                            sent: true,
                            received: message.status,
                            video: message.mediaUrl
                        }
                    }

                })
                setMessages(messages => GiftedChat.append(messages, threads))
                if (loading) {
                    setLoading(false)
                }
                //setMessages(threads);
                //console.log(threads);
            })

        return () => unsubscribe();
    }, [])

    //methods
    const onSend = useCallback((message = []) => {
        const utility = new Utility();
        utility.checkNetwork()
            .then(() => {
                const messageDic = message[0];

                //setMessages(messages=>GiftedChat.append(messages,message)) 
                firestore()
                    .collection("chatRooms")
                    .doc(props.route.params.data.roomId)
                    .collection("messages")
                    .add({
                        body: messageDic.text,
                        createdDate: firestore.Timestamp.fromDate(messageDic.createdAt),
                        mediaUrl: '',
                        senderId: props.doctor.doctor.doctorId,
                        status: false,
                        type: 'text'
                    })
                    .then(res => {
                        console.log("message sent")

                        firestore()
                            .collection("chatRooms")
                            .doc(props.route.params.data.roomId)
                            .update({
                                lastMessage: messageDic.text,
                                lastUpdatedDate: firestore.Timestamp.fromDate(messageDic.createdAt),
                                doctorMessageCount: firestore.FieldValue.increment(1)
                            })
                            .then((data) => { console.log("done room update"); })
                            .catch(err => { console.log(err); })
                    })
                    .catch(err => console.log("message sent err"));
            })
            .catch(err => console.log(err))

    }, [])

    function SendButton(props) {
        return (
            <Send {...props}>
                <MaterialIcon name="send-circle" size={45} color="#147efb" />
            </Send>
        )
    }

    async function uploadImage(path, filename) {
        const utility = new Utility();
        utility.checkNetwork()
            .then(() => {
                setUploading(true);
                const task = storage().ref().child('imagesChat/' + filename).putFile(path);

                task.on('state_changed', snapshot => {
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                }, (error) => {
                    setUploading(false);
                    Alert.alert("Unable to send message.");
                    console.log(error);
                    switch (error.code) {
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;

                        case 'storage/canceled':
                            // User canceled the upload
                            break;

                        case 'storage/unknown':
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                    }
                }, () => {
                    task.snapshot.ref.getDownloadURL()
                        .then(url => {
                            var dateNow = new Date();

                            firestore()
                                .collection("chatRooms")
                                .doc(props.route.params.data.roomId)
                                .collection("messages")
                                .add({
                                    body: "",
                                    createdDate: firestore.Timestamp.fromDate(dateNow),
                                    mediaUrl: url,
                                    senderId: props.doctor.doctor.doctorId,
                                    status: false,
                                    type: 'image'
                                })
                                .then(res => {
                                    console.log("message sent")
                                    setUploading(false);
                                    setMenuVisible(false);
                                    firestore()
                                        .collection("chatRooms")
                                        .doc(props.route.params.data.roomId)
                                        .update({
                                            lastMessage: "📸",
                                            lastUpdatedDate: firestore.Timestamp.fromDate(dateNow),
                                            doctorMessageCount: firestore.FieldValue.increment(1)
                                        })
                                        .then((data) => { console.log("done room update"); })
                                        .catch(err => { console.log(err); })
                                })
                                .catch(err => console.log("message sent err"));
                        })
                        .catch(err => {
                            console.log("url ::", err);
                            setUploading(false);
                            Alert.alert("Unable to send message.");
                        })

                })

            })
            .catch(err => { console.log(err); });
    }


    function pickFromGallery() {
        ImagePicker.openPicker({
            compressImageQuality: 0.8,
            cropping: true,
            enableRotationGesture: true,
            mediaType: 'photo',
        })
            .then(image => {
                let filename = image.path.substring(image.path.lastIndexOf('/') + 1, image.path.length);
                uploadImage(image.path.slice(7), filename);
                console.log("path:: ", image.path.slice(7));
            })
            .catch(err => {
                console.log(err);
                if (err.message == 'Required permission missing') {
                    Alert.alert(
                        'Permission Denied',
                        'Please allow permission to use storage.',
                        [

                            { text: 'GO TO SETTINGS', style: 'default', onPress: () => { Linking.openSettings() } },
                            { text: 'Ok', }
                        ],
                        { cancelable: false },
                    );
                    return;
                }
                else if (err.message == 'User cancelled image selection') {
                    return;
                }
                else {
                    Alert.alert("Some error occurred while fetching the image.");
                }

            })
    }

    function captureImage() {
        ImagePicker.openCamera({
            compressImageQuality: 0.8,
            cropping: true,
            enableRotationGesture: true,
            mediaType: 'photo'
        })
            .then(image => {
                let filename = image.path.substring(image.path.lastIndexOf('/') + 1, image.path.length);
                uploadImage(image.path, filename);
                console.log("path:: ", image.path);
            })
            .catch(err => {
                console.log(err);
                if (err.message == 'Required permission missing') {
                    Alert.alert(
                        'Permission Denied',
                        'Please allow permission to use camera.',
                        [

                            { text: 'GO TO SETTINGS', style: 'default', onPress: () => { Linking.openSettings() } },
                            { text: 'Ok', }
                        ],
                        { cancelable: false },
                    );
                    return;
                }
                else if (err.message == 'User cancelled image selection') {
                    return;
                }
                else {
                    Alert.alert("Some error occurred while fetching the image.");
                }

            })
    }

    function Attachments() {
        return (
            <MaterialIcon style={{ marginLeft: 5, alignSelf: 'center' }} onPress={() => setMenuVisible(true)} name="attachment" size={40} color="#147efb" />
        )
    }

    function backAction() {
        firestore()
            .collection("chatRooms")
            .doc(props.route.params.data.roomId)
            .update({
                userMessageCount: 0
            })
            .then((data) => {
                console.log("done room update");
                props.navigation.goBack()
            })
            .catch(err => { console.log(err); })
    }

    // const VideoView=({currentMessage})=>{
    //     var paused=true
    //     return(
    //            <TouchableOpacity onPress={()=>paused=!paused}>
    //                 <Video
    //                     resizeMode="contain"
    //                     controls={false}
    //                     playInBackground={false}
    //                     paused={paused}
    //                     source={{uri:currentMessage.video}}
    //                     style={{width:270,height:180,}}
    //                 />
    //            </TouchableOpacity>     
    //     )
    // }

    const handelVideoCall = () => {
        setVideoCallVisible(true)
    }

    const confirmVideoCall = () => {
        setCallLoading(true);

        CallService.getUserById(props.route.params.data.userId)
            .then(userCallId => {
                console.log("ID::", userCallId);
                CallService.startCall([userCallId],{name:props.doctor.doctor.name,profilePic:props.doctor.doctor.profilePictureUrl})
                .then(localStream=>{
                    setCallLoading(false);
                    props.navigation.navigate("VideoCall", {type:'outgoing', data: props.route.params.data });
                })
                .catch(err=>{console.log(err);setCallLoading(false);});
                setVideoCallVisible(false)
            })
            .catch(err => {
                console.log(err);
                setCallLoading(false);
            })

    }


    if (loading) {
        return (
            <LoadingScreen backgroundColor="#fff" color="#147EFB" />
        )
    }

    return (
        <>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <StatusBar backgroundColor="#fff" barStyle='dark-content' />
                <ChatHeader backAction={() => { backAction() }} videoCall={() => { handelVideoCall() }} title={props.route.params.data.userName} profilePicUrl={props.route.params.data.userProfilePicUrl} />
                <View style={{ flex: 1 }}>
                    <GiftedChat
                        messages={messages}
                        user={{
                            _id: props.doctor.doctor.doctorId,
                            name: props.doctor.doctor.name
                        }}
                        onSend={message => onSend(message)}
                        scrollToBottom={true}
                        renderSend={(props) => SendButton(props)}
                        renderActions={() => Attachments()}
                        imageStyle={{ width: 270, height: 170 }}
                    // renderMessageVideo={VideoView}

                    />
                </View>
            </View>
            <Modal
                onDismiss={() => {
                    if (uploading) {
                        return;
                    }
                    setMenuVisible(false)
                }}
                visible={menuVisible}
                contentContainerStyle={styles.modal}
            >
                {uploading ?
                    <View style={{ justifyContent: "center", alignItems: 'center' }}>
                        <Spinner
                            type="Wave"
                            color="#147efb"
                            isVisible={uploading}
                            size={50}
                        />
                        <Subheading>Sending</Subheading>
                    </View>
                    :
                    <>
                        <List.Section>
                            <List.Item style={{ ...styles.item }} title="Pick Image from Gallery" left={() => <List.Icon icon="image-plus" color="#147efb" />} onPress={() => pickFromGallery()} />
                            <List.Item style={styles.item} title="Capture New Image" left={() => <List.Icon icon="camera-plus" color="#147efb" />} onPress={() => captureImage()} />
                        </List.Section>
                        <Button mode="contained" color="#147efb" onPress={() => setMenuVisible(false)} >Cancel</Button>
                    </>
                }

            </Modal>
            <Modal
                onDismiss={() => {
                    if (callLoading) {
                        return;
                    }
                    setVideoCallVisible(false)
                }}
                visible={videoCallVisible}
                contentContainerStyle={{ ...styles.modal, height: 350, justifyContent: "flex-start" }}
            >
                <Title style={{ alignSelf: 'center' }}>Video Call</Title>

                {props.route.params.data.userProfilePicUrl === '' ?
                    <Avatar.Text style={{ alignSelf: 'center', marginVertical: 20 }} theme={{ colors: { primary: '#6a1b9a' } }} size={110} label={props.route.params.data.userName.split(' ')[0][0] + props.route.params.data.userName.split(' ')[1][0]} />
                    :
                    <Avatar.Image source={{ uri: props.route.params.data.userProfilePicUrl }} style={{ alignSelf: 'center', marginVertical: 20 }} theme={{ colors: { primary: '#147efb' } }} size={110} />
                }

                <Title style={{ alignSelf: 'center' }}>{props.route.params.data.userName}</Title>
                <Paragraph style={{ alignSelf: 'center', textAlign: 'center' }}>{"Are you sure you want to video call " + props.route.params.data.userName}</Paragraph>
                <Button loading={callLoading} mode='contained' style={{ height: 40, marginTop: 20, borderRadius: 20 }} icon="video-outline" onPress={() => { confirmVideoCall() }} theme={{ colors: { primary: '#147efb' } }} >Video Call</Button>
                <IconButton
                    icon="close"
                    color="#147efb"
                    size={20}
                    onPress={() => setVideoCallVisible(false)}
                    style={styles.closeButton}
                />
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    modal: {
        width: 300,
        height: 200,
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 4,
        padding: 10,
    },
    item: {
        backgroundColor: '#b6b6b660',
        borderRadius: 8,
        padding: 0,
        marginBottom: 10
    },
    closeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Chat);