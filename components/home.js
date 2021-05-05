import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, BackHandler, ToastAndroid, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Avatar, Button, Headline, Caption, Paragraph, RadioButton, Subheading, TextInput, Title, Card } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import { useFocusEffect,useNavigation} from '@react-navigation/native';
import { HomeHeader } from '../utility/ViewUtility';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import Fontisto from 'react-native-vector-icons/FontAwesome';
import ConnectyCube from 'react-native-connectycube';
import { CallService } from '../Services/videoCalling/CallService';
import { EventRegister } from 'react-native-event-listeners';
import Spinner from 'react-native-spinkit';
import firestore from '@react-native-firebase/firestore';
import { addAppointments } from '../redux/ActionCreators';
import ComunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({
    addAppointments: (appointmentsList) => dispatch(addAppointments(appointmentsList))
})

function Home(props) {
    const navigaition = useNavigation()

    //refs
    const animatedView1 = useRef(0);
    const animatedView2 = useRef(0);

    const todayDate = new Date();
    const userData = auth().currentUser.providerData;
    const [backCount, setBackCount] = useState(0);
    const [isNewAppointmentsLoading, setisNewAppointmentsLoading] = useState(true);
    const [newAppointmentsData, setnewAppointmentsData] = useState([])
    const [isTodayAppointmentsLoading, setisTodayAppointmentsLoading] = useState(true)
    const [appointmentsTodayData, setappointmentsTodayData] = useState([])
    // const [lengthNewAppointments, setlengthNewAppointments] = useState(0)
    // const [isScreenFocused, setisScreenFocused] = useState(true)

    //lifecycle
    useEffect(() => {
        setUpCallListeners();

        const logout=EventRegister.addEventListener('logout',()=>{
            unsbscribeNewAppintments();
            unsbscribeSheduledAppointments();
        })

        // const blurEvent=navigaition.addListener('blur',()=>{
        //     setisScreenFocused(false)
        //     console.log("blur event");
        //     console.log(isScreenFocused);
        // })


        const dayEnd = new Date()
        dayEnd.setHours(23, 59, 59, 999)

        const unsbscribeNewAppintments = firestore().collection('appointments')
            .where('doctorId', '==', auth().currentUser.uid)
            .where('time', '>=', firestore.Timestamp.now())
            .where('status', '==', 'pending')
            .orderBy('time', 'asc')
            .onSnapshot(querySnapshot => {
                return Promise.all(querySnapshot.docs.map(async appointment => {
                    return {
                        id: appointment.id,
                        userData: await getUserData(appointment.data().userId),
                        ...appointment.data()
                    }
                }))
                    .then(list => {
                        props.addAppointments(list)
                        setnewAppointmentsData(list.length <= 6 ? list : list.slice(0, 6));
                        if (isNewAppointmentsLoading) {
                            setisNewAppointmentsLoading(false)
                            // setlengthNewAppointments(list.length)
                        }
                        // else {
                        //     console.log("reached before if");
                        //     if (lengthNewAppointments < list.length) {
                        //         console.log("Inside if");
                        //         navigaition.setOptions({ tabBarBadge: list.length - lengthNewAppointments })
                        //         setlengthNewAppointments(list.length)
                        //     }
                        //     else {
                        //         setlengthNewAppointments(list.length)

                        //     }

                        // }
                    })
                    .catch(err => {
                        console.log(err);
                        ToastAndroid.show("Unable to fetch the appointment data.", ToastAndroid.LONG)
                    })

            })

        const unsbscribeSheduledAppointments = firestore().collection('appointments')
            .where('doctorId', '==', auth().currentUser.uid)
            .where('time', '>=', firestore.Timestamp.now())
            .where('time', '<=', firestore.Timestamp.fromDate(dayEnd))
            .where('status', '==', 'accepted')
            .orderBy('time', 'asc')
            .limit(4)
            .onSnapshot(querySnapshot => {
                return Promise.all(querySnapshot.docs.map(async appointment => {
                    return {
                        id: appointment.id,
                        userData: await getUserData(appointment.data().userId),
                        ...appointment.data()
                    }
                }))
                    .then(list => {
                        setappointmentsTodayData(list)
                        if (isTodayAppointmentsLoading) {
                            setisTodayAppointmentsLoading(false)
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        ToastAndroid.show("Unable to fetch scheduled appointment data.", ToastAndroid.LONG)
                    })
            })

        return () => {
            EventRegister.removeEventListener(logout);
            unsbscribeNewAppintments();
            unsbscribeSheduledAppointments();
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            // console.log("focus Event");
            // console.log(isScreenFocused);
            // setisScreenFocused(true)
            // navigaition.setOptions({ tabBarBadge: null })
            StatusBar.setBackgroundColor('#fff');
            animatedView1.current.slideInRight(500);
            animatedView2.current.slideInUp(500);
            const backhandler = BackHandler.addEventListener("hardwareBackPress", () => {
                backCount === 0 ? ToastAndroid.show('Press back to exit', ToastAndroid.SHORT) : BackHandler.exitApp();
                setBackCount(1);
                setTimeout(() => { setBackCount(0) }, 3000)
                return true;
            })

            return () => {
                backhandler.remove();
            }
        }, [])

    );

    //methods
    const acceptAppointment = (appointment) => {
        firestore().collection('appointments').doc(appointment.id).update({ status: "accepted" })
            .then(() => {
                if (appointment.type == "online") {
                    firestore().collection('chatRooms')
                        .where('doctorId', '==', auth().currentUser.uid)
                        .where('userId', '==', appointment.userId)
                        .get()
                        .then(data => {
                            if (data.size === 1) {
                                const chatRoom = data.docs.map(room => {
                                    return room.data();
                                })

                                const messsData = {
                                    body: `Your appointment with ${props.doctor.doctor.name} is confirmed for ${moment(appointment.time.toDate()).format("DD/MM/YYYY hh:mm a")}. `,
                                    createdDate: firestore.Timestamp.now(),
                                    mediaUrl: '',
                                    senderId: auth().currentUser.uid,
                                    status: false,
                                    type: 'text'
                                }
                                firestore().collection('chatRooms').doc(chatRoom[0].roomId).collection('messages').add(messsData)
                                    .then(() => {

                                    })
                                    .catch(err => console.log(err))

                                const updatData = {
                                    appointmentDate: appointment.time,
                                    lastMessage: `Your appointment with ${props.doctor.doctor.name} is confirmed for ${moment(appointment.time.toDate()).format("DD/MM/YYYY hh:mm a")}. `,
                                    doctorMessageCount: chatRoom[0].doctorMessageCount + 1,
                                    lastUpdatedDate: firestore.Timestamp.now()
                                }

                                firestore().collection('chatRooms').doc(chatRoom[0].roomId).update(updatData)
                                    .then(() => {
                                        ToastAndroid.show(`Appointment accepted.`, ToastAndroid.SHORT)
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            }
                            else {
                                const chatRoomData = {
                                    appointmentDate: appointment.time,
                                    createdDate: firestore.Timestamp.now(),
                                    lastUpdatedDate: firestore.Timestamp.now(),
                                    doctorId: auth().currentUser.uid,
                                    doctorName: props.doctor.doctor.name,
                                    doctorProfilePicUrl: props.doctor.doctor.profilePictureUrl,
                                    doctorMessageCount: 1,
                                    userId: appointment.userId,
                                    userMessageCount: 0,
                                    userName: appointment.userData.name,
                                    userProfilePicUrl: appointment.userData.profilePictureUrl,
                                    lastMessage: `Your appointment with ${props.doctor.doctor.name} is confirmed for ${moment(appointment.time.toDate()).format("DD/MM/YYYY hh:mm a")}. `,
                                    roomId: '',
                                }

                                firestore().collection('chatRooms').add(chatRoomData)
                                    .then(values => {
                                        firestore().collection('chatRooms').doc(values.id).update({ roomId: values.id })
                                            .then(() => {
                                                const messData = {
                                                    body: chatRoomData.lastMessage,
                                                    createdDate: firestore.Timestamp.now(),
                                                    mediaUrl: '',
                                                    senderId: auth().currentUser.uid,
                                                    status: false,
                                                    type: 'text'
                                                }
                                                firestore().collection('chatRooms').doc(values.id).collection('messages').add(messData)
                                                    .then(mess => {
                                                        ToastAndroid.show(`Appointment accepted.`, ToastAndroid.SHORT)
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                    })
                                            })
                                            .catch(err => {
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

    const getUserData = (uid) => {
        return firestore().collection('users').doc(uid).get()
            .then(data => {
                return data.data();
            })
            .catch(err => {
                console.log(err);
            })
    }

    function setUpCallListeners() {
        ConnectyCube.videochat.onCallListener = (session, extension) => onIncomingCall(session, extension);
        ConnectyCube.videochat.onRemoteStreamListener = (session, userId, stream) => {
            //console.log("remote stream from home.");
            EventRegister.emit('onRemoteStreamListener', { session: session, userId: userId, stream: stream })
        };
        ConnectyCube.videochat.onAcceptCallListener = (session, userId, extension) => {
            console.log("CALLER ACCEPTED YOUR CALL");
            EventRegister.emit('onAcceptCallListener', { session: session, userId: userId, extension: extension })
        };
        ConnectyCube.videochat.onUserNotAnswerListener = (session, userId) => {
            console.log("user not answered listner");
            EventRegister.emit('onUserNotAnswerListener', { session: session, userId: userId })
        };
    }

    function onIncomingCall(session, extraData) {
        CallService.processOnCallListener(session)
            .then(() => {
                props.navigation.navigate("VideoCall", { type: 'incoming', dataIncoming: extraData, session: session })
            })
            .catch(err => {

            })
        // console.log("userId::",userId);
        // console.log("sessionId::",sessionId);
        //console.log("data::",extraData);

    }

    //component

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
                        <Button mode='contained' style={{ alignSelf: 'center', flex: 1.7, margin: 10, borderRadius: 20, elevation: 2 }} labelStyle={{ fontWeight: 'bold', color: "#fff" }} contentStyle={{ height: 45 }} onPress={() => { acceptAppointment(item) }} theme={{ colors: { primary: '#147efb' } }}>accept</Button>
                        <Button mode='outlined' style={{ alignSelf: 'center', flex: 1, margin: 10, borderRadius: 15 }} onPress={() => { declineAppointment(item.id) }} theme={{ colors: { primary: '#FC3D39' } }}>decline</Button>
                    </View>
                </Card>
            </Animatable.View>
        )
    }

    const TodayView = ({ item, index }) => {
        let genderAge = item.userData.gender[0].toUpperCase() + "/" + moment().diff(new Date(item.userData.dob).toLocaleDateString(), 'years', false)

        return (
            <Animatable.View key={index.toString()} animation="slideInRight" style={{}} duration={500} delay={50} useNativeDriver={true}>
                <TouchableOpacity onPress={() => { props.navigation.navigate('AppointmentDetailedView', { data: item }) }} style={styles.appointmentsToday}>
                    <Title numberOfLines={1}>{item.userData.name}</Title>
                    <Caption style={{ paddingHorizontal: 0, paddingVertical: 0 }}>{genderAge}</Caption>
                    <Paragraph numberOfLines={1} style={{ overflow: "hidden", width: 210 }}><Paragraph style={{ fontWeight: "bold" }}>issue: </Paragraph>{item.problem}</Paragraph>
                    <Paragraph style={{ fontWeight: "bold" }}>Mode:</Paragraph>
                    <Subheading style={{ textTransform: 'uppercase', paddingHorizontal: 20, paddingVertical: 5, fontWeight: 'bold', borderRadius: 25, backgroundColor: '#fff', elevation: 3, alignSelf: 'flex-start' }}>{item.type}</Subheading>
                    <View style={styles.todayTime}>
                        <Title style={{ alignSelf: "center", textAlign: "center", color: "#fff", textTransform: "uppercase" }}>{moment(item.time.toDate()).format("hh:mm a")}</Title>
                    </View>
                </TouchableOpacity>
            </Animatable.View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar backgroundColor="#fff" barStyle='dark-content' />
            <HomeHeader profilePic={props.doctor.doctor.profilePictureUrl} name={props.doctor.doctor.name} phoneNo={props.doctor.doctor.phoneNo} onPress={() => { props.navigation.navigate("Settings") }} />
            <ScrollView contentContainerStyle={{ paddingBottom: '0%' }} nestedScrollEnabled={true}>
                <Animatable.View animation="slideInUp" style={{}} duration={500} delay={50} useNativeDriver={true}>
                    <Subheading style={{ fontWeight: 'bold', paddingTop: 15, paddingHorizontal: 15 }}>Schedule Today</Subheading>
                    <Animatable.View ref={ref => animatedView1.current = ref} useNativeDriver={true}>
                        {isTodayAppointmentsLoading ?
                            <View style={{ marginVertical: '6%', justifyContent: 'center' }}>
                                <Spinner
                                    type="Wave"
                                    color="#147efb"
                                    style={{ alignSelf: "center" }}
                                    isVisible={true}
                                    size={60}
                                />
                            </View>
                            :
                            appointmentsTodayData.length === 0 ?
                                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: "#fff" }}>
                                    <Caption style={{ width: '50%', alignSelf: "center", textAlign: 'center' }}>No Appointments Today just relax!! </Caption>
                                </View>
                                :
                                <FlatList
                                    data={appointmentsTodayData}
                                    renderItem={TodayView}
                                    keyExtractor={(item, index) => index.toString()}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 15 }}
                                    nestedScrollEnabled={true}
                                />
                        }
                    </Animatable.View>
                    <Subheading style={{ fontWeight: 'bold', paddingHorizontal: 15 }}>New Appointments</Subheading>
                    <Animatable.View ref={ref => animatedView2.current = ref} useNativeDriver={true}>
                        {isNewAppointmentsLoading ?
                            <View style={{ marginVertical: '30%', justifyContent: 'center' }}>
                                <Spinner
                                    type="Wave"
                                    color="#147efb"
                                    style={{ alignSelf: "center" }}
                                    isVisible={true}
                                    size={60}
                                />
                            </View>
                            :
                            newAppointmentsData.length === 0 ?
                                <View style={{ flex: 1, marginTop: '30%', justifyContent: 'center', alignItems: 'center' }}>
                                    <ComunityIcon name='calendar-alert' size={80} color="#147efb" />
                                    <Subheading style={{}}>No New Appointments.</Subheading>
                                </View>
                                :
                                <FlatList
                                    data={newAppointmentsData}
                                    renderItem={NewView}
                                    keyExtractor={(item, index) => index.toString()}
                                    contentContainerStyle={{ paddingHorizontal: 15 }}
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled={true}
                                />}
                    </Animatable.View>
                </Animatable.View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    appointmentsToday: {
        backgroundColor: '#fff',
        padding: 10,
        width: 300,
        height: 165,
        borderRadius: 12,
        elevation: 3,
        overflow: "hidden",
        marginRight: 10,
        marginVertical: 10
    },
    todayTime: {
        backgroundColor: "#147efb",
        position: "absolute",
        right: 0,
        height: 165,
        width: 82.5,
        borderTopLeftRadius: 82.5,
        borderBottomLeftRadius: 82.5,
        justifyContent: 'center'
    },
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
        elevation: 2,
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
        elevation: 2
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Home);