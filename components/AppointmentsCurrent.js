import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StatusBar, BackHandler, ToastAndroid, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Avatar, Button, Headline, Caption, Paragraph, RadioButton, Subheading, TextInput, Title, Card } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import Fontisto from 'react-native-vector-icons/FontAwesome';
import ComunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';


//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor,
        appointments: state.appointments
    };
};

const mapDispatchToProps = (dispatch) => ({

})

//component
function AppointmentsCurrent(props) {

    //states
    const todayDate = new Date();

    //lifecycles
    useFocusEffect(
        useCallback(() => {
            StatusBar.setBackgroundColor('#fff');
        }, [])
    )

    //methods

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

    const NewView = ({ item, index }) => {

        let genderAge = item.userData.gender[0].toUpperCase() + "/" + moment().diff(new Date(item.userData.dob).toLocaleDateString(), 'years', false)
        var time;
        var appointmentDate = item.time.toDate();
        const yesterday = new Date(Date.now() - 86400000);
        if (todayDate.getDate() === appointmentDate.getDate()) {
            var time = "Today " + moment(appointmentDate).format("hh:mm a");
        }
        else if (yesterday.getDate() === appointmentDate.getDate()) {
            var time = "Yesterday " + moment(appointmentDate).format("hh:mm a");
        }
        else if (todayDate.getFullYear() === appointmentDate.getFullYear()) {
            var time = moment(appointmentDate).format("Do MMM hh:mm a");
        }
        else {
            var time = moment(appointmentDate).format("DD/MM/YYYY hh:mm a");
        }

        return (
            <Animatable.View animation="slideInUp" style={{ marginBottom: 10 }} duration={500} delay={50} useNativeDriver={true}>
                <Card style={styles.card} onPress={() => { props.navigation.navigate('AppointmentDetailedView', { data: item }) }}>
                    <Card.Content style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                        <View style={{ flexDirection: "row" }}>
                            <Fontisto name="user" size={30} style={{ margin: 5, marginRight: 10, alignSelf: "center" }} color="#147efb" />
                            <Title style={{ paddingVertical: 0, alignSelf: "center", marginVertical: 0, flex: 1 }}>{item.userData.name}</Title>
                        </View>
                        <Caption style={{ paddingHorizontal: 0, paddingVertical: 0 }}>{genderAge}</Caption>
                        <Paragraph numberOfLines={2} style={{ width: '80%', marginVertical: 0, padding: 0 }}><Paragraph style={{ fontWeight: 'bold' }}>issue:</Paragraph>{item.problem}</Paragraph>
                        {/* <View style={{ width: '60%' }}>
                            <Paragraph numberOfLines={1} style={{ overflow: "hidden", }}>adfasdf</Paragraph>
                        </View> */}
                        <Paragraph style={{ fontWeight: "bold" }}>mode:</Paragraph>
                        <Subheading style={styles.date}>{item.type}</Subheading>
                        <View style={styles.status}>
                            <Text style={{
                                textTransform: "uppercase", fontSize: 14
                                , fontWeight: "bold", alignSelf: 'center', color: "#147efb"
                            }}>{time}</Text>
                        </View>
                    </Card.Content>
                    <View style={styles.footer}>
                        <Button mode='contained' style={{ alignSelf: 'center', flex: 1.7, margin: 10, borderRadius: 20,elevation:2 }} labelStyle={{fontWeight:'bold',color:"#fff"}} contentStyle={{height:45}} onPress={() => { acceptAppointment(item) }} theme={{ colors: { primary: '#147efb' } }}>accept</Button>
                        <Button mode='outlined' style={{ alignSelf: 'center', flex: 1, margin: 10, borderRadius: 15 }} onPress={() => { declineAppointment(item.id) }} theme={{ colors: { primary: '#FC3D39' } }}>decline</Button>
                    </View>
                </Card>
            </Animatable.View>
        )
    }


    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar backgroundColor='#fff' barStyle='dark-content' />
            <Animatable.View animation="slideInUp" style={{flex:1}} duration={500} delay={50} useNativeDriver={true}>
                {props.appointments.length === 0 ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ComunityIcon name='calendar-alert' size={80} color="#147efb" />
                        <Subheading style={{}}>No New Appointments.</Subheading>
                    </View>
                    :
                    <FlatList
                        data={props.appointments}
                        renderItem={NewView}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingHorizontal: 15 }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    />}
            </Animatable.View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        elevation: 3,
        borderRadius: 15,
    },
    date: {
        backgroundColor: "#e3f2fd",
        paddingHorizontal: 20,
        borderRadius: 25,
        paddingVertical: 8,
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        color: '#147efb',
        marginVertical: 10
    },
    status: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 21.5,
        // borderBottomRightRadius: 10,
        paddingHorizontal: 20,
        height: 43,
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 5,
        // borderLeftWidth: 0.3,
        // borderTopWidth: 0.3,
        // borderColor: '#b6b6b6',
        elevation:2,
    },
    footer: {
        width: '100%',
        height: 70,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f8f8f8',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        flexDirection: "row",
        justifyContent: 'center',
        elevation:2,
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(AppointmentsCurrent);