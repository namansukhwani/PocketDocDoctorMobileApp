import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, BackHandler, ToastAndroid, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Avatar, Button, Headline, Caption, Paragraph, RadioButton, Subheading, TextInput, Title, Card } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import { useFocusEffect } from '@react-navigation/native';
import { HomeHeader } from '../utility/ViewUtility';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import Fontisto from 'react-native-vector-icons/FontAwesome';
import ConnectyCube from 'react-native-connectycube';
import { CallService } from '../Services/videoCalling/CallService';
import { EventRegister } from 'react-native-event-listeners';

const dataSchedule = [
    {
        name: "Janhavi Thakur",
        issue: "Knee Problem",
        mode: "online",
        time: new Date("11/21/2020 11:00 AM"),
        gender: 'F/20'
    },
    {
        name: "Manas Satpute",
        issue: "High blood pressure and headache",
        mode: "offline",
        time: new Date("11/21/2020 02:00 PM"),
        gender: 'M/20'
    },
]

const data = [
    {
        name: "Joy Singh",
        issue: "Knee Problem",
        mode: "online",
        time: new Date("11/21/2020 11:00 AM"),
        gender: 'M/20'
    },
    {
        name: "Anurag Sirothiya",
        issue: "High blood pressure and headache",
        mode: "offline",
        time: new Date("12/13/2020 02:00 PM"),
        gender: 'M/20'
    },
    {
        name: "Nidan Tegar",
        issue: "Knee Problem",
        mode: "online",
        time: new Date("11/29/2020 11:00 AM"),
        gender: 'M/20'
    },
    {
        name: "Rajdeep Kamat",
        issue: "High blood pressure and headache",
        mode: "offline",
        time: new Date("11/24/2020 02:00 PM"),
        gender: 'M/20'
    },
]

//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({

})

function Home(props) {

    //refs
    const animatedView1 = useRef(0);
    const animatedView2 = useRef(0);

    const todayDate = new Date();
    const userData = auth().currentUser.providerData;
    const [backCount, setBackCount] = useState(0);

    //lifecycle
    useEffect(()=>{
        setUpCallListeners();
    },[]);

    useFocusEffect(
        useCallback(() => {
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

    function setUpCallListeners(){
        ConnectyCube.videochat.onCallListener=(session, extension)=>onIncomingCall(session,extension);
        ConnectyCube.videochat.onRemoteStreamListener=(session, userId, stream) =>{
            console.log("remote stream from home.");
            EventRegister.emit('onRemoteStreamListener',{session:session, userId:userId, stream:stream})
        }
    }

    function onIncomingCall(session,extraData){
        CallService.processOnCallListener(session)
        .then(()=>{
            props.navigation.navigate("VideoCall", {type:'incoming', dataIncoming:extraData,session:session })
        })
        .catch(err=>{

        })
        // console.log("userId::",userId);
        // console.log("sessionId::",sessionId);
        //console.log("data::",extraData);
        
    }
    
    //component

    const NewView = ({ item, index }) => {

        var time;
        var appointmentDate = new Date(item.time);
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
                <Card style={styles.card} onPress={() => { }}>
                    <Card.Content style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                        <View style={{ flexDirection: "row" }}>
                            <Fontisto name="user" size={30} style={{ margin: 5, marginRight: 10, alignSelf: "center" }} color="#147efb" />
                            <Title style={{ paddingVertical: 0, alignSelf: "center", marginVertical: 0, flex: 1 }}>{item.name}</Title>
                        </View>
                        <Caption style={{ paddingHorizontal: 0, paddingVertical: 0 }}>{item.gender}</Caption>
                        <Paragraph numberOfLines={2} style={{ width: '80%', marginVertical: 0, padding: 0 }}><Paragraph style={{ fontWeight: 'bold' }}>issue:</Paragraph>{item.issue}</Paragraph>
                        {/* <View style={{ width: '60%' }}>
                            <Paragraph numberOfLines={1} style={{ overflow: "hidden", }}>adfasdf</Paragraph>
                        </View> */}
                        <Paragraph style={{ fontWeight: "bold" }}>mode:</Paragraph>
                        <Subheading style={styles.date}>{item.mode}</Subheading>
                        <View style={styles.status}>
                            <Text style={{
                                textTransform: "uppercase", fontSize: 14
                                , fontWeight: "bold", alignSelf: 'center', color: "#147efb"
                            }}>{time}</Text>
                        </View>
                    </Card.Content>
                    <View style={styles.footer}>
                        <Button mode='outlined' style={{ alignSelf: 'center', flex: 1, margin: 10 }} theme={{ colors: { primary: '#147efb' } }}>accept</Button>
                        <Button mode='outlined' style={{ alignSelf: 'center', flex: 1, margin: 10 }} theme={{ colors: { primary: '#FC3D39' } }}>decline</Button>
                    </View>
                </Card>
            </Animatable.View>
        )
    }

    const TodayView = ({ item, index }) => {
        return (
            <Animatable.View animation="slideInRight" style={{}} duration={500} delay={50} useNativeDriver={true}>
                <TouchableOpacity style={styles.appointmentsToday}>
                    <Title numberOfLines={1}>{item.name}</Title>
                    <Caption style={{ paddingHorizontal: 0, paddingVertical: 0 }}>{item.gender}</Caption>
                    <Paragraph numberOfLines={1} style={{ overflow: "hidden", width: 210 }}><Paragraph style={{ fontWeight: "bold" }}>issue: </Paragraph>{item.issue}</Paragraph>
                    <Paragraph style={{ fontWeight: "bold" }}>Mode:</Paragraph>
                    <Subheading style={{ textTransform: 'uppercase', paddingHorizontal: 20, paddingVertical: 5, fontWeight: 'bold', borderRadius: 25, backgroundColor: '#fff', elevation: 3, alignSelf: 'flex-start' }}>{item.mode}</Subheading>
                    <View style={styles.todayTime}>
                        <Title style={{ alignSelf: "center", textAlign: "center", color: "#fff", textTransform: "uppercase" }}>{moment(item.time).format("hh:mm a")}</Title>
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
                    <Animatable.View ref={ref=>animatedView1.current=ref}  useNativeDriver={true}>
                        <FlatList
                            data={dataSchedule}
                            renderItem={TodayView}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 15 }}
                            nestedScrollEnabled={true}
                        />
                    </Animatable.View>
                    <Subheading style={{ fontWeight: 'bold', paddingHorizontal: 15 }}>New Appointments</Subheading>
                    <Animatable.View ref={ref=>animatedView2.current=ref} useNativeDriver={true}>
                        <FlatList
                            data={data}
                            renderItem={NewView}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingHorizontal: 15 }}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        />
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
        borderRadius: 10,
    },
    date: {
        backgroundColor: "#147efb",
        paddingHorizontal: 20,
        borderRadius: 25,
        paddingVertical: 8,
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        color: '#fff',
        marginVertical: 10
    },
    status: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 21.5,
        borderBottomRightRadius: 10,
        paddingHorizontal: 20,
        height: 43,
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 5,
        borderLeftWidth: 0.3,
        borderTopWidth: 0.3,
        borderColor: '#b6b6b6'
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
        justifyContent: 'center'
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Home);