import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, TouchableOpacity, ToastAndroid } from 'react-native';
import { Avatar, Button, Headline, Caption, Paragraph, RadioButton, Subheading, TextInput, Title, Card } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import { Agenda } from 'react-native-calendars';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import LottieView from 'lottie-react-native';
import firestore from '@react-native-firebase/firestore';
import Spinner from 'react-native-spinkit';
import { EventRegister } from 'react-native-event-listeners';

//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({

})

//component
function Schedule(props) {

    //states
    const [isDataLoading, setisDataLoading] = useState(true)
    const [schduleData, setschduleData] = useState({})

    //lifecycles

    useFocusEffect(
        useCallback(() => {
            StatusBar.setBackgroundColor('#fff');
        }, [])
    )

    useEffect(() => {

        const logout=EventRegister.addEventListener('logout',()=>{
            unsbscribeSheduledAppointments();
        })

        // setData();
        const unsbscribeSheduledAppointments = firestore().collection('appointments')
            .where('doctorId', '==', auth().currentUser.uid)
            // .where('status', '==', 'accepted','completed')
            // .where('status', '==', 'completed')
            .onSnapshot(querySnapshot => {
                return Promise.all(querySnapshot.docs.map(async appointment => {
                    return {
                        id: appointment.id,
                        userData: await getUserData(appointment.data().userId),
                        ...appointment.data()
                    }
                }))
                    .then(list => {
                        // console.log(list);
                        setData(list)
                        if (isDataLoading) {
                            setisDataLoading(false)
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        ToastAndroid.show("Unable to fetch the appointment data.", ToastAndroid.LONG)
                    })
            })

        return () => {
            unsbscribeSheduledAppointments();
            EventRegister.removeEventListener(logout);
        }
    }, [])

    //methods
    const getUserData = (uid) => {
        return firestore().collection('users').doc(uid).get()
            .then(data => {
                return data.data();
            })
            .catch(err => {
                console.log(err);
            })
    }

    const timeToString = (time) => {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }

    const setData = (newData) => {
        var newItems = {}
        newData.forEach(data => {
            if (data.status === "accepted" || data.status === "completed") {
                var timeStr = timeToString(data.time.toDate());
                if (newItems[timeStr]) {
                    newItems[timeStr].push(data);
                }
                else {
                    newItems[timeStr] = [data];
                }
            }
        })
        setschduleData(newItems);
        // console.log("data", newItems);
    }

    const renderItem = (item) => {
        let genderAge = item.userData.gender[0].toUpperCase() + "/" + moment().diff(new Date(item.userData.dob).toLocaleDateString(), 'years', false)

        return (
            <Animatable.View animation="slideInRight" style={{}} duration={500} useNativeDriver={true}>
                <TouchableOpacity onPress={()=>props.navigation.navigate('AppointmentDetailedView', { data: item })} style={styles.appointmentsToday}>
                    <Title numberOfLines={1}>{item.userData.name}</Title>
                    <Caption style={{ paddingHorizontal: 0, paddingVertical: 0 }}>{genderAge}</Caption>
                    <Paragraph numberOfLines={1} style={{ overflow: "hidden", width: 210 }}><Paragraph style={{ fontWeight: "bold" }}>issue: </Paragraph >{item.problem}</Paragraph>
                    <Paragraph style={{ fontWeight: "bold" }}>Mode:</Paragraph>
                    <Subheading style={{ textTransform: 'uppercase', paddingHorizontal: 20, paddingVertical: 5, fontWeight: 'bold', borderRadius: 25, backgroundColor: '#fff', elevation: 3, alignSelf: 'flex-start' }}>{item.type}</Subheading>
                    <View style={styles.todayTime}>
                        <Title style={{ alignSelf: "center", textAlign: "center", color: "#fff", textTransform: "uppercase" }}>{moment(item.time.toDate()).format("hh:mm a")}</Title>
                    </View>
                </TouchableOpacity>
            </Animatable.View>
        );
    }

    const renderEmptyData = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: "#fff" }}>
                {isDataLoading ?
                    <Spinner
                        type="Wave"
                        color="#147efb"
                        style={{ alignSelf: "center" }}
                        isVisible={true}
                        size={60}
                    />
                    :
                    <>
                        <LottieView
                            source={require('../assets/relax_animation.json')}
                            autoPlay={true}
                            resizeMode='contain'
                            style={{ width: '70%', height: 260, alignSelf: 'center', backgroundColor: "#fff" }}
                            speed={1}
                        />
                        <Subheading style={{ fontWeight: "bold", textAlign: 'center' }}>No Appointments Today just relax!! </Subheading>

                    </>
                }
            </View>
        );
    }

    const rowHasChanged = (r1, r2) => {
        return r1.name !== r2.name;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar backgroundColor='#fff' barStyle='dark-content' />
            <Agenda
                items={schduleData}
                //loadItemsForMonth={(day) => loadItems(day)}
                selected={new Date()}
                renderItem={(item) => renderItem(item)}
                renderEmptyData={() => renderEmptyData()}
                theme={{
                    dotColor: '#147efb',
                    selectedDotColor: '#ffffff',
                    selectedDayBackgroundColor: '#147efb',
                    todayTextColor: '#147efb',
                    agendaTodayColor: '#147efb',
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    appointmentsToday: {
        backgroundColor: '#fff',
        padding: 10,
        height: 165,
        elevation: 1,
        borderRadius: 12,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Schedule);