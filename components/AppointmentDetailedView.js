import React from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Text, Image,ToastAndroid,Linking} from 'react-native';
import { Paragraph, IconButton, Subheading, Button } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

function AppointmentDetailedView(props) {
    const data = props.route.params.data;

    //methods

    const getColors=()=>{
        if(data.status==="pending"){
            return {
                backgroundColor:"#ffd740",
                lightColor:"#fff8e1",
            }
        }
        else if(data.status==="accepted"){
            return {
                backgroundColor:"#147efb",
                lightColor:"#e3f2fd",
            }
        }
        else if(data.status==="completed"){
            return {
                backgroundColor:"#4caf50",
                lightColor:"#c8e6c9",
            }
        }
        else{
            return {
                backgroundColor:"#d32f2f",
                lightColor:"#ffebee",
            }
        }
    }

    const acceptAppointment = (appointment) => {
        firestore().collection('appointments').doc(appointment.id).update({ status: "accepted" })
            .then(() => {
                if (appointment.type == "online") {
                    firestore().collection('chatRooms')
                    .where('doctorId','==',auth().currentUser.uid)
                    .where('userId','==',appointment.userId)
                    .get()
                    .then(data=>{
                        if(data.size===1){
                            const chatRoom=data.docs.map(room=>{
                                return room.data();
                            })

                            const messsData={
                                body:`Your appointment with ${props.doctor.doctor.name} is confirmed for ${moment(appointment.time.toDate()).format("DD/MM/YYYY hh:mm a")}. `,
                                createdDate:firestore.Timestamp.now(),
                                mediaUrl:'',
                                senderId:auth().currentUser.uid,
                                status:false,
                                type:'text'
                            }
                            firestore().collection('chatRooms').doc(chatRoom[0].roomId).collection('messages').add(messsData)
                            .then(()=>{

                            })
                            .catch(err=>console.log(err))

                            const updatData={
                                appointmentDate:appointment.time,
                                lastMessage:`Your appointment with ${props.doctor.doctor.name} is confirmed for ${moment(appointment.time.toDate()).format("DD/MM/YYYY hh:mm a")}. `,
                                doctorMessageCount:chatRoom[0].doctorMessageCount+1,
                                lastUpdatedDate:firestore.Timestamp.now()
                            }

                            firestore().collection('chatRooms').doc(chatRoom[0].roomId).update(updatData)
                            .then(()=>{
                                ToastAndroid.show(`Appointment accepted.`, ToastAndroid.SHORT)
                            })
                            .catch(err=>{
                                console.log(err);
                            })
                        }
                        else{
                            const chatRoomData = {
                                appointmentDate:appointment.time,
                                createdDate:firestore.Timestamp.now(),
                                lastUpdatedDate:firestore.Timestamp.now(),
                                doctorId:auth().currentUser.uid,
                                doctorName:props.doctor.doctor.name,
                                doctorProfilePicUrl:props.doctor.doctor.profilePictureUrl,
                                doctorMessageCount:1,
                                userId:appointment.userId,
                                userMessageCount:0,
                                userName:appointment.userData.name,
                                userProfilePicUrl:appointment.userData.profilePictureUrl,
                                lastMessage:`Your appointment with ${props.doctor.doctor.name} is confirmed for ${moment(appointment.time.toDate()).format("DD/MM/YYYY hh:mm a")}. `,
                                roomId:'',
                            }

                            firestore().collection('chatRooms').add(chatRoomData)
                            .then(values=>{
                                firestore().collection('chatRooms').doc(values.id).update({roomId:values.id})
                                .then(()=>{
                                    const messData={
                                        body:chatRoomData.lastMessage,
                                        createdDate:firestore.Timestamp.now(),
                                        mediaUrl:'',
                                        senderId:auth().currentUser.uid,
                                        status:false,
                                        type:'text'
                                    }
                                    firestore().collection('chatRooms').doc(values.id).collection('messages').add(messData)
                                    .then(mess=>{
                                        ToastAndroid.show(`Appointment accepted.`, ToastAndroid.SHORT)
                                    })
                                    .catch(err=>{
                                        console.log(err);
                                    })
                                })
                                .catch(err=>{
                                    console.log(err);
                                })
                            })
                        }
                    })

                   
                }
                else {
                    ToastAndroid.show(`Appointment accepted.`, ToastAndroid.SHORT)

                }
            })
            .catch(err => {
                console.log(err);
                ToastAndroid.show("Unable to perform this action currently.", ToastAndroid.LONG)
            })



    }

    const declineAppointment = (appointmentId) => {
        firestore().collection('appointments').doc(appointmentId).update({ status: 'declined' })
            .then(() => {
                ToastAndroid.show(`Appointment declined`, ToastAndroid.SHORT)
            })
            .catch(err => {
                console.log(err);
                ToastAndroid.show("Unable to perform this action currently.", ToastAndroid.LONG)
            })
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <StatusBar backgroundColor={getColors().backgroundColor} barStyle='dark-content' showHideTransition={true}  />
            <ScrollView>
                <Animatable.View animation="slideInDown" duration={500} useNativeDriver={true}>
                    <View style={{...styles.topTimeAccepted,backgroundColor:getColors().backgroundColor}} >
                        <Paragraph style={{...styles.topTagAccepted,backgroundColor:getColors().lightColor,color:getColors().backgroundColor}}>{data.status==="accepted"?"Scheduled":data.status}</Paragraph>
                        <Text style={{ fontWeight: 'bold', color: "#fff", fontSize: 34 }}>{moment(data.time.toDate()).format('Do MMMM YYYY')},</Text>
                        <Text style={{ fontWeight: 'bold', color: "#fff", fontSize: 30 }}>{moment(data.time.toDate()).format('h:mm a')}</Text>
                    </View>
                    <View style={styles.avatarDiv}>
                        <View style={styles.avatar}>
                            {data.userData.profilePictureUrl === '' ?
                                <Image style={{ height: 90, width: 90, borderRadius: 45, }} size={85} source={require('../assets/user_avatar.png')} />
                                :
                                <Image style={{ height: 90, width: 90, borderRadius: 45, }} resizeMode="cover" source={{ uri: data.userData.profilePictureUrl }} />
                            }
                        </View>
                        <View style={{ justifyContent: "center", alignItems: "center", borderRadius: 50, backgroundColor: "#fff", marginLeft: 12 }}>
                            <IconButton
                                icon="phone"
                                style={{ backgroundColor: getColors().lightColor, elevation: 2 }}
                                color={getColors().backgroundColor}
                                size={35}
                                onPress={() => {Linking.openURL(`tel:+91${data.userData.phoneNo}`) }}
                            />
                        </View>
                        <View style={{ justifyContent: "center", alignItems: "center", borderRadius: 50, backgroundColor: "#fff", marginLeft: 12 }}>
                            <IconButton
                                icon="email"
                                style={{ backgroundColor: getColors().lightColor, elevation: 2 }}
                                color={getColors().backgroundColor}
                                size={35}
                                onPress={() => { Linking.openURL(`mailto:${data.userData.email}`)}}
                            />
                        </View>
                    </View>
                </Animatable.View>
                <Animatable.View style={{ paddingHorizontal: 15, paddingBottom: 15 }} animation="slideInUp" duration={500} useNativeDriver={true}>
                    <Text style={{ fontSize: 30, fontWeight: "bold" }}>{data.userData.name}</Text>
                    <Subheading style={{ fontWeight: "bold", marginTop: 8, marginBottom: 4 }}>Appointment ID</Subheading>
                    <Paragraph>{data.id}</Paragraph>
                    <View style={{ justifyContent: "flex-start", alignItems: 'center', display: 'flex', flexDirection: "row", marginTop: 5 }}>
                        <View style={{ ...styles.ageGender, marginRight: 5,backgroundColor:getColors().lightColor }}>
                            <Subheading style={{ marginTop: 0, paddingTop: 0, fontWeight: "bold", }}>Age</Subheading>
                            <Paragraph>{moment().diff(new Date(data.userData.dob).toLocaleDateString(), 'years', false) + " yrs"}</Paragraph>
                        </View>
                        <View style={{ ...styles.ageGender, marginLeft: 5,backgroundColor:getColors().lightColor }}>
                            <Subheading style={{ fontWeight: "bold", marginTop: 0, paddingTop: 0, }}>Gender</Subheading>
                            <Paragraph>{data.userData.gender}</Paragraph>
                        </View>
                    </View>


                    <Subheading style={{ fontWeight: "bold", marginTop: 8, marginBottom: 4 }}>Problem</Subheading>
                    <Paragraph>{data.problem}</Paragraph>

                    <Subheading style={{ fontWeight: "bold", marginTop: 8, marginBottom: 4 }}>Appointment Mode</Subheading>
                    <Paragraph style={{ fontSize: 18, textTransform: 'capitalize', fontWeight: 'bold', color: getColors().backgroundColor, backgroundColor: getColors().lightColor, alignSelf: "flex-start", paddingHorizontal: 20, paddingVertical: 5, borderRadius: 15 }}>{data.type}</Paragraph>
                </Animatable.View>
            </ScrollView>
            {data.status === "completed" ?
                null
                :
                <View style={{...styles.buttons,backgroundColor:getColors().lightColor}}>
                    {data.status === "accepted" && <Button mode="contained" style={{ flex: 1, borderRadius: 15 }} contentStyle={{ height: 48 }} color="#147EFB" onPress={() => { }}>Mark as Complete</Button>}
                    {data.status === "pending" &&
                        <>
                            <Button mode='contained' style={{ alignSelf: 'center', flex: 1.7, marginRight:10, borderRadius: 20, elevation: 2 }} labelStyle={{ fontWeight: 'bold', color: "#fff" }} contentStyle={{ height: 45 }} onPress={() => { acceptAppointment(item) }} theme={{ colors: { primary: getColors().backgroundColor } }}>accept</Button>
                            <Button mode='outlined' style={{ alignSelf: 'center', flex: 1,marginLeft:10,backgroundColor:'#fff',  borderRadius: 15 }} onPress={() => { declineAppointment(item.id) }} theme={{ colors: { primary: '#FC3D39' } }}>decline</Button>
                        </>
                    }
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    topTimeAccepted: {
        flex: 1,
        height: 270,
        backgroundColor: "#147efb",
        borderBottomRightRadius: 135,
        // borderBottomLeftRadius:40,
        // paddingTop:60,
        justifyContent: "center",
        alignItems: "center",
        zIndex: -10
    },
    topTagAccepted: {
        textTransform: 'capitalize',
        backgroundColor: "#e3f2fd",
        color: "#147efb",
        elevation: 2,
        paddingHorizontal: 20,
        paddingVertical: 4,
        borderRadius: 25,
        fontWeight: "bold",
        fontSize: 15
    },
    avatarDiv: {
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: -52.5,
        paddingHorizontal: 15,
        display: "flex",
        flexDirection: "row"
    },
    avatar: {
        // marginLeft: '4%',
        alignSelf: 'flex-start',
        justifyContent: "center",
        alignItems: 'center',
        backgroundColor: "#fff",
        // height:100,
        // width:100,
        borderRadius: 60,
        padding: 7
    },
    ageGender: {
        flex: 1,
        backgroundColor: "#e3f2fd",
        padding: 10,
        borderRadius: 15,
        justifyContent: 'center',
        // alignItems:"center",
    },
    buttons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "row",
        padding: 15,
        // paddingTop: 20,
        backgroundColor: "#e3f2fd",
        elevation: 10,
        zIndex: 10,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    }
});

export default AppointmentDetailedView;