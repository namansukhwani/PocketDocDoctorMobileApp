import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, BackHandler, ToastAndroid, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar, Button, Headline, Paragraph, List, Title, Switch, Subheading, Caption, Dialog, Portal, Checkbox } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import { useFocusEffect } from '@react-navigation/native';
import ComunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({

})

const allDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

//component
function Settings(props) {

    //refs
    const animatedView = useRef(0);

    //states
    const [switchButton, setSwitchButton] = useState(true);
    const [fromTime, setFromTime] = useState(new Date("11/20/2020 11:00 AM"));
    const [toTime, setToTime] = useState(new Date("11/20/2020 05:00 PM"));
    const [days, setDays] = useState([1, 2, 3, 4, 5]);
    const [showDaysSelection, setShowDaysSelection] = useState(false);
    const [sunday, setsunday] = useState(days.includes(0));
    const [monday, setmonday] = useState(days.includes(1));
    const [tue, settue] = useState(days.includes(2));
    const [wed, setwed] = useState(days.includes(3));
    const [thu, setthu] = useState(days.includes(4));
    const [fri, setfri] = useState(days.includes(5));
    const [sat, setsat] = useState(days.includes(6));
    const [showFromTime, setShowFromTime] = useState(false);
    const [showToTime, setShowToTime] = useState(false);

    //lifecycle
    useFocusEffect(
        useCallback(() => {
            StatusBar.setBackgroundColor('#e3f2fd');
            animatedView.current.slideInUp(500);
        }, [])
    )

    //methods

    const handelDaysSelect = () => {

        const newDays = [];

        if (sunday) {
            newDays.push(0);
        }
        if (monday) {
            newDays.push(1);
        }
        if (tue) {
            newDays.push(2);
        }
        if (wed) {
            newDays.push(3);
        }
        if (thu) {
            newDays.push(4);
        }
        if (fri) {
            newDays.push(5);
        }
        if (sat) {
            newDays.push(6);
        }

        setDays(newDays);
        setShowDaysSelection(false);

    }

    return (
        <>
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
                <StatusBar backgroundColor="#e3f2fd" barStyle="dark-content" translucent={false} />
                <ScrollView >
                    <View style={{ backgroundColor: '#e3f2fd' }} >
                        <View style={{ paddingHorizontal: 15, }}>
                            {props.doctor.doctor.profilePictureUrl === '' ?
                                <Avatar.Image style={{ elevation: 2, alignSelf: 'center', marginBottom: 15, marginTop: 10 }} size={130} source={require('../assets/user_avatar.png')} />
                                :
                                <Avatar.Image style={{ elevation: 2, alignSelf: 'center', marginBottom: 15, marginTop: 10 }} size={130} source={{ uri: props.doctor.doctor.profilePictureUrl }} />
                            }
                            <Headline style={{ alignSelf: 'center', fontWeight: "bold" }}>{props.doctor.doctor.name}</Headline>
                            <View style={{ flexDirection: "row", justifyContent: 'center' }}>
                                <ComunityIcon style={{ alignSelf: 'center', marginRight: 3 }} name="email" size={20} color="#147efb" />
                                <Paragraph style={{ alignSelf: 'center' }}>{props.doctor.doctor.email}</Paragraph>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: 'center', marginBottom: 10 }}>
                                <ComunityIcon style={{ alignSelf: 'center', marginRight: 3 }} name="phone" size={20} color="#147efb" />
                                <Paragraph style={{ alignSelf: 'center' }}>{props.doctor.doctor.phoneNo}</Paragraph>
                            </View>
                            <LottieView
                                source={require('../assets/bubbles_animation.json')}
                                autoPlay={true}
                                resizeMode='contain'
                                loop={true}
                                style={{ flex: 1, zIndex: -10, position: 'absolute', width: '100%', height: '100%', opacity: 0.6 }}
                                speed={0.5}
                            />
                        </View>

                        <Animatable.View ref={ref => animatedView.current = ref} animation="slideInUp" duration={500} delay={50} useNativeDriver={true} style={{ flex: 1, padding: 15, elevation: 6, backgroundColor: '#fff', borderTopRightRadius: 30, borderTopLeftRadius: 30 }}>
                            <List.Section>
                                <List.Item
                                    onPress={() => { }}
                                    style={styles.listItem2}
                                    title="Status"
                                    right={() =>
                                        <>
                                            <View style={{ flexDirection: "row", justifyContent: 'center', marginRight: 10 }}>
                                                <Paragraph style={{ fontWeight: "bold", textTransform: "uppercase", color: (switchButton ? "#53d769" : '#FC3D39'), alignSelf: "center", marginRight: 10 }}>{switchButton ? "ACTIVE" : "INACTIVE"}</Paragraph>
                                                <Switch
                                                    value={switchButton}
                                                    onValueChange={() => setSwitchButton(!switchButton)}
                                                    color="#147efb"
                                                />
                                            </View>
                                        </>
                                    }
                                    left={() => <List.Icon icon="circle-slice-8" color={switchButton ? "#53d769" : '#FC3D39'} />}
                                />
                                <List.Subheader style={{ paddingHorizontal: 0 }}>Availability Time</List.Subheader>
                                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                                    <TouchableOpacity onPress={() => setShowFromTime(true)} style={{ ...styles.timeButton, marginRight: 10 }}>
                                        <Subheading style={{ alignSelf: "center" }} ><Subheading style={{ fontWeight: 'bold',color:"#147efb" }}>From: </Subheading>{moment(fromTime).format("hh:mm a")}</Subheading>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setShowToTime(true)} style={styles.timeButton}>
                                        <Subheading style={{ alignSelf: "center" }} ><Subheading style={{ fontWeight: 'bold',color:"#147efb" }}>To: </Subheading>{moment(toTime).format("hh:mm a")}</Subheading>
                                    </TouchableOpacity>
                                </View>
                                <List.Subheader style={{ paddingHorizontal: 0, paddingBottom: 0 }}>Availability Days</List.Subheader>
                                <Caption>Click below to change the Availability Days</Caption>
                                <TouchableOpacity style={styles.days} onPress={() => setShowDaysSelection(true)}>
                                    {days.map(dayNo => {

                                        return (
                                            <View key={dayNo.toString()} style={{ flex: 1, justifyContent: 'center', padding: 10, }}>
                                                <Paragraph style={{ alignSelf: 'center', color: '#147efb', fontWeight: 'bold' }}>{allDays[dayNo]}</Paragraph>
                                            </View>
                                        )
                                    })}
                                </TouchableOpacity>
                                <List.Subheader style={{ paddingHorizontal: 0 }}>ACCOUNT SETTINGS</List.Subheader>
                                <List.Item
                                    onPress={() => { }}
                                    style={styles.listItem}
                                    title="Edit Profile"
                                    right={() => <List.Icon icon="chevron-right-circle" color="#147efb" />}
                                    left={() => <List.Icon icon="account" color="#147efb" />}
                                />
                                <List.Item
                                    onPress={() => { }}
                                    style={styles.listItem}
                                    title="Change Password"
                                    right={() => <List.Icon icon="chevron-right-circle" color="#147efb" />}
                                    left={() => <List.Icon icon="lock-open-check" color="#147efb" />}
                                />
                                <List.Item
                                    onPress={() => { }}
                                    style={styles.listItem}
                                    title="Change Email"
                                    right={() => <List.Icon icon="chevron-right-circle" color="#147efb" />}
                                    left={() => <List.Icon icon="at" color="#147efb" />}
                                />
                                <List.Item
                                    onPress={() => { }}
                                    style={styles.listItem}
                                    title="Appointments Settings"
                                    right={() => <List.Icon icon="chevron-right-circle" color="#147efb" />}
                                    left={() => <List.Icon icon="medical-bag" color="#147efb" />}
                                />
                                <List.Item
                                    onPress={() => { }}
                                    style={styles.listItem}
                                    title="Payment Options"
                                    right={() => <List.Icon icon="chevron-right-circle" color="#147efb" />}
                                    left={() => <List.Icon icon="credit-card-settings-outline" color="#147efb" />}
                                />

                            </List.Section>

                            <Button mode="contained" color="#147efb" style={{ marginTop: 15, borderRadius: 15 }} contentStyle={{ height: 45 }} onPress={() => { auth().signOut(); props.navigation.navigate("login") }} >logout</Button>
                        </Animatable.View>
                    </View>
                </ScrollView>
                {showFromTime &&
                    <DateTimePicker
                        testID="timePicker1"
                        value={fromTime}
                        mode='time'
                        display='clock'
                        onChange={(event, selectedDate) => {
                            if (event.type == 'set') {
                                setShowFromTime(false);
                                setFromTime(selectedDate);
                                //console.log(selectedDate);
                            }
                            else {
                                setShowFromTime(false);
                                return;
                            }
                        }}
                        onTouchCancel={() => setShowFromTime(false)}
                    />
                }
                {showToTime &&
                    <DateTimePicker
                        testID="timePicker2"
                        value={toTime}
                        mode='time'
                        display='clock'
                        onChange={(event, selectedDate) => {
                            if (event.type == 'set') {
                                setShowToTime(false);
                                setToTime(selectedDate);
                                //console.log(selectedDate);
                            }
                            else {
                                setShowToTime(false);
                                return;
                            }
                        }}
                        onTouchCancel={() => setShowToTime(false)}
                    />
                }
            </View>


            <Portal>
                <Dialog visible={showDaysSelection} onDismiss={() => setShowDaysSelection(false)}>
                    <Dialog.Title>Select Days</Dialog.Title>
                    <Dialog.ScrollArea>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <List.Section >
                                <List.Item
                                    title="Sunday"
                                    titleStyle={{ fontWeight: 'bold', color:sunday ? "#147efb" : "#000"}}
                                    style={styles.daysItem}
                                    right={() => <Checkbox.IOS status={sunday ? "checked" : "unchecked"} color="#147efb" />}
                                    onPress={() => setsunday(!sunday)}
                                />
                                <List.Item
                                    title="Monday"
                                    titleStyle={{ fontWeight: 'bold',color:monday ? "#147efb" : "#000" }}
                                    style={styles.daysItem}
                                    right={() => <Checkbox.IOS status={monday ? "checked" : "unchecked"} color="#147efb" />}
                                    onPress={() => setmonday(!monday)}
                                />
                                <List.Item
                                    title="Tuesday"
                                    titleStyle={{ fontWeight: 'bold', color:tue ? "#147efb" : "#000"}}
                                    style={styles.daysItem}
                                    right={() => <Checkbox.IOS status={tue ? "checked" : "unchecked"} color="#147efb" />}
                                    onPress={() => settue(!tue)}
                                />
                                <List.Item
                                    title="Wednesday"
                                    titleStyle={{ fontWeight: 'bold',color:wed ? "#147efb" : "#000" }}
                                    style={styles.daysItem}
                                    right={() => <Checkbox.IOS status={wed ? "checked" : "unchecked"} color="#147efb" />}
                                    onPress={() => setwed(!wed)}
                                />
                                <List.Item
                                    title="Thursday"
                                    titleStyle={{ fontWeight: 'bold',color:thu ? "#147efb" : "#000" }}
                                    style={styles.daysItem}
                                    right={() => <Checkbox.IOS status={thu ? "checked" : "unchecked"} color="#147efb" />}
                                    onPress={() => setthu(!thu)}
                                />
                                <List.Item
                                    title="Friday"
                                    titleStyle={{ fontWeight: 'bold',color:fri ? "#147efb" : "#000" }}
                                    style={styles.daysItem}
                                    right={() => <Checkbox.IOS status={fri ? "checked" : "unchecked"} color="#147efb" />}
                                    onPress={() => setfri(!fri)}
                                />
                                <List.Item
                                    title="Saturday"
                                    titleStyle={{ fontWeight: 'bold',color:sat ? "#147efb" : "#000" }}
                                    style={styles.daysItem}
                                    right={() => <Checkbox.IOS status={sat ? "checked" : "unchecked"} color="#147efb" />}
                                    onPress={() => setsat(!sat)}
                                />
                            </List.Section>
                        </ScrollView>
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={() => setShowDaysSelection(false)} theme={{ colors: { primary: '#147efb' } }}>CANCEL</Button>
                        <Button onPress={() => handelDaysSelect()} theme={{ colors: { primary: '#147efb' } }}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    )
}

const styles = StyleSheet.create({
    listItem: {
        elevation: 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 0,
        marginBottom: 12
    },
    listItem2: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 0,
        marginBottom: 12
    },
    timeButton: {
        backgroundColor:"#e3f2fd",
        flex: 1,
        padding: 10,
        // borderWidth: 1,
        borderColor: '#b6b6b6',
        borderRadius: 15,
        elevation:1
    },
    days: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        // borderWidth: 1,
        // borderColor: '#b6b6b6',
        borderRadius: 15,
        elevation:1
    },
    daysItem: {
        elevation: 1,
        backgroundColor: '#e3f2fd',
        borderRadius: 15,
        marginBottom: 12,
        // borderWidth: 1,
        borderColor: '#b6b6b6'
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);