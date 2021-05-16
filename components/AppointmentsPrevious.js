import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Dimensions, StatusBar, BackHandler, ToastAndroid, StyleSheet, FlatList, Animated } from 'react-native';
import { Avatar, Button, Headline, Paragraph, RadioButton, FAB, Subheading, TextInput, Title, Card, Caption } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
//import Animated from 'react-native-reanimated';
import Fontisto from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import Spinner from 'react-native-spinkit';
import { EventRegister } from 'react-native-event-listeners';
import ComunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const height = Dimensions.get('screen').height;

//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({

})

//component
function AppointmentsPrevious(props) {
    //Animated 
    const scrollY = new Animated.Value(0);
    const diffClapScrollY = Animated.diffClamp(scrollY, 0, 100);
    const FabY = diffClapScrollY.interpolate({
        inputRange: [0, height - 35],
        outputRange: [0, height + 35],
    })

    //states
    const todayDate = new Date();
    const [data, setdata] = useState([])
    const [dataLoading, setdataLoading] = useState(true)

    //lifecycles
    useEffect(() => {

        const logout = EventRegister.addEventListener('logout', () => {
            unsbscribePrevious();
        })

        const dayStart = new Date()
        dayStart.setHours(0, 0, 0, 0)

        const unsbscribePrevious = firestore().collection('appointments')
            .where('doctorId', '==', auth().currentUser.uid)
            .where('time', '<=', firestore.Timestamp.fromDate(dayStart))
            .orderBy('time', 'desc')
            .onSnapshot(querySnapshot => {
                return Promise.all(querySnapshot.docs.map(async appointment => {
                    return {
                        ref: appointment.ref,
                        id: appointment.id,
                        userData: await getUserData(appointment.data().userId),
                        ...appointment.data()
                    }
                }))
                    .then(list => {
                        settelPriviousPendingAppointments(list)
                        if (dataLoading) {
                            setdataLoading(false);
                        }
                        setdata(list)
                    })
                    .catch(err => {
                        ToastAndroid.show("Unable to fetch previous appointment data.", ToastAndroid.LONG)
                        console.log(err);
                    })
            },
                err => {
                    ToastAndroid.show("Unable to fetch previous appointment data.", ToastAndroid.LONG)
                    console.log(err);
                })

        return () => {
            unsbscribePrevious();
            EventRegister.removeEventListener(logout);
        }
    }, [])

    useFocusEffect(
        useCallback(() => {
            StatusBar.setBackgroundColor('#fff');
        }, [])
    )

    //methods

    const settelPriviousPendingAppointments = (list) => {
        const filteredAppointments = list.filter(app => (app.status == 'pending'))
        if (filteredAppointments.length > 0) {
            const batchUpdate = firestore().batch();

            filteredAppointments.forEach(app => {
                batchUpdate.update(app.ref, {
                    status: 'declined'
                })
            })

            batchUpdate.commit().then(() => {
                console.log("previous appointmnets setteled");
            })
                .catch(err => { console.log("unable to settel previous appointmnets ", err); });
        }

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

    const CardView = ({ item, index }) => {
        let genderAge = item.userData.gender[0].toUpperCase() + "/" + moment().diff(new Date(item.userData.dob).toLocaleDateString(), 'years', false)
        var color;
        var time;
        var appointmentDate = new Date(item.time.toDate());
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

        if (item.status === "approved") {
            color = "#53D769";
        }
        else if (item.status === "declined") {
            color = "#FC3D39";
        }
        else if (item.status === 'pending') {
            color = "#FECB2E";
        }
        else {
            color = "#147efb";
        }

        return (
            <Animatable.View animation="slideInUp" style={{ marginBottom: 10 }} duration={500} delay={100} useNativeDriver={true}>
                <Card style={styles.card} onPress={() => { props.navigation.navigate('AppointmentDetailedView', { data: item }) }}>
                    <Card.Content style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                        <View style={{ flexDirection: "row" }}>
                            <Fontisto name="user" size={30} style={{ margin: 5, marginRight: 10, alignSelf: "center" }} color="#147efb" />
                            <Title style={{ paddingVertical: 0, alignSelf: "center", marginVertical: 0, flex: 1 }}>{item.userData.name}</Title>

                        </View>
                        <Caption style={{ marginVertical: 0, padding: 0 }}>{genderAge}</Caption>
                        <View style={{ width: '60%' }}>
                            <Paragraph numberOfLines={1} style={{ overflow: "hidden", }}>{item.problem}</Paragraph>
                        </View>
                        <Subheading style={styles.date}>{time}</Subheading>
                        <View style={styles.status}>
                            <Text style={{
                                textTransform: "uppercase", fontSize: 14
                                , fontWeight: "bold", alignSelf: 'center', color: color
                            }}>{item.status}</Text>
                        </View>
                    </Card.Content>
                </Card>
            </Animatable.View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff", }}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            {dataLoading ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Spinner
                        type="Wave"
                        color="#147efb"
                        style={{ alignSelf: "center" }}
                        isVisible={true}
                        size={60}
                    />
                </View>
                :
                data.length == 0 ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ComunityIcon name='calendar-alert' size={80} color="#147efb" />
                        <Subheading style={{}}>No New Appointments.</Subheading>
                    </View>
                    :
                    <Animated.FlatList
                        data={data}
                        renderItem={CardView}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingHorizontal: 15, marginTop: 10, paddingBottom: 24 }}
                        onScroll={Animated.event([
                            {
                                nativeEvent: { contentOffset: { y: scrollY } }
                            }
                        ], { useNativeDriver: true })}
                        scrollEventThrottle={16}
                        alwaysBounceVertical={false}
                    />
            }
            <FAB
                label="filters"
                icon='filter-plus'
                small={true}
                style={{ ...styles.fab, transform: [{ translateY: FabY }] }}
                onPress={() => console.log("Filters")}
                color="#147efb"
                animated={true}

            />
        </View>
    )
}

const styles = StyleSheet.create({
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
        right: 15,
        top: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 40,
        elevation: 6,
        paddingHorizontal: 10,
        height: 40,
        alignSelf: "center",
        justifyContent: "center",
        padding: 5
    },
    fab: {
        position: 'absolute',
        alignSelf: "center",
        bottom: 5,
        backgroundColor: "#fff",
        elevation: 10,
        borderWidth: 2,
        borderColor: '#147efb'
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AppointmentsPrevious);