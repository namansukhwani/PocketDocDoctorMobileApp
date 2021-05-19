import React, { useEffect, useState, useCallback, useReducer, useRef } from 'react';
import { View, StyleSheet, StatusBar, Text, ToastAndroid, Keyboard, BackHandler, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Headline, Paragraph, RadioButton, Subheading, Checkbox, TextInput, Title, Caption, Portal, Dialog, List } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import auth from '@react-native-firebase/auth';
import Spinner from 'react-native-spinkit';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Utility } from '../utility/utility';
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux';
import { addDoctorDetails } from '../redux/ActionCreators';
import firestore from '@react-native-firebase/firestore';
import { Modalize } from 'react-native-modalize';

const allDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const defaultSlots = [
    {
        // id:"sdfgw432421",
        start: firestore.Timestamp.fromDate(new Date("April 23, 2021 13:30:00")),
        end: firestore.Timestamp.fromDate(new Date("April 23, 2021 14:30:00"))
    },
    {
        // id:"asdwfadg8998",
        start: firestore.Timestamp.fromDate(new Date("April 23, 2021 16:30:00")),
        end: firestore.Timestamp.fromDate(new Date("April 23, 2021 18:30:00"))
    }
]

//redux 
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({
    addDoctorDetails: (uid, doctorData) => dispatch(addDoctorDetails(uid, doctorData)),
})

//component
function GetNewUserData(props) {

    const userAuthData = auth().currentUser;
    //refs
    const giveReviewModal = useRef(null);
    const [_, forceUpdate] = useReducer(x => x + 1, 0)

    const [name, setName] = useState(userAuthData.providerData[0].displayName);
    const [email, setEmail] = useState(userAuthData.providerData[0].email);
    const [doctorRegistrationNo, setDoctorRegistrationNo] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [gender, setGender] = useState('male');
    const [dob, setDob] = useState(new Date());
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [pincode, setPincode] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error1, setError1] = useState(false);
    const [error2, setError2] = useState(false);
    const [error3, setError3] = useState(false);
    const [error4, setError4] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backCount, setBackCount] = useState(0);

    const [dataGetPage, setdataGetPage] = useState(0);
    const [about, setabout] = useState('');
    const [error5, seterror5] = useState(false);
    const [exprience, setexprience] = useState('');
    const [error6, seterror6] = useState(false);
    const [doctorType, setdoctorType] = useState("");
    const [error7, seterror7] = useState(false);

    const [days, setdays] = useState([1, 2, 3, 4, 5]);
    const [showDaysSelection, setShowDaysSelection] = useState(false);
    const [sunday, setsunday] = useState(days.includes(0));
    const [monday, setmonday] = useState(days.includes(1));
    const [tue, settue] = useState(days.includes(2));
    const [wed, setwed] = useState(days.includes(3));
    const [thu, setthu] = useState(days.includes(4));
    const [fri, setfri] = useState(days.includes(5));
    const [sat, setsat] = useState(days.includes(6));
    const [slots, setSlots] = useState(defaultSlots);
    const [noOfPatients, setnoOfPatients] = useState("3")
    const [error8, seterror8] = useState(false);
    const [onlineFee, setonlineFee] = useState('');
    const [error9, seterror9] = useState(false);
    const [offlineFee, setofflineFee] = useState('');
    const [error10, seterror10] = useState(false);

    const [fromTime, setFromTime] = useState(new Date("11/20/2020 11:00 AM"));
    const [toTime, setToTime] = useState(new Date("11/20/2020 05:00 PM"));
    const [showFromTime, setShowFromTime] = useState(false);
    const [showToTime, setShowToTime] = useState(false);
    //lifecycle

    useFocusEffect(
        useCallback(() => {
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

    //regex
    const onlyNo = /^[0-9]*$/;

    function getAge() {
        var today = new Date();
        var age = today.getFullYear() - dob.getFullYear();
        var m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    }

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

        setdays(newDays);
        setShowDaysSelection(false);

    }

    function completeRegistration() {

        if (doctorRegistrationNo.trim() === '') {
            setError4(true);
            ToastAndroid.show("Doctor Registration Number can\'t be empty.", ToastAndroid.LONG);
        }
        else if (phoneNo.trim().length < 10 || phoneNo.trim().length > 10) {
            setError1(true);
            ToastAndroid.show("Mobile no can't be less or more than 10 digits", ToastAndroid.LONG);
        }
        else if (!onlyNo.test(phoneNo)) {
            setError1(true)
            ToastAndroid.show("Mobile no can't have alphabets.", ToastAndroid.LONG);
        }
        else if (gender === '') {
            ToastAndroid.show("Please Fill in your gender to Continue", ToastAndroid.LONG);
        }
        else if (getAge() <= 20) {
            ToastAndroid.show("Minimum age to register is 21 years.", ToastAndroid.LONG);
        }
        else if (address.trim().length < 10) {
            setError2(true)
            ToastAndroid.show("Address can\'t be less than 10 letters.", ToastAndroid.LONG);
        }
        else if (pincode.trim().length < 6 || pincode.trim().length > 6 || !onlyNo.test(pincode)) {
            setError3(true)
            ToastAndroid.show("Enter a correct Pincode", ToastAndroid.LONG);
        }
        else if (exprience.trim().length === 0 || !onlyNo.test(exprience)) {
            seterror6(true)
            ToastAndroid.show("Enter a correct Experience", ToastAndroid.LONG);
            return
        }
        else if (doctorType.trim().length === 0) {
            seterror7(true)
            ToastAndroid.show("Specialization can\'t be empty.", ToastAndroid.LONG);
            return

        }
        else if (days.length === 0) {
            ToastAndroid.show("Availablity days can\'t be empty.", ToastAndroid.LONG);
            return
        }
        else if (slots.length === 0) {
            ToastAndroid.show("Number of slots can\'t be 0.", ToastAndroid.LONG);
            return
        }
        else if (noOfPatients.trim() === "0" || noOfPatients.trim().length === 0 || !onlyNo.test(noOfPatients)) {
            seterror8(true)
            ToastAndroid.show("Please fill correct no of patients.", ToastAndroid.LONG);
            return
        }
        else if (onlineFee.trim().length === 0 || onlineFee.trim() == "0" || !onlyNo.test(onlineFee)) {
            seterror9(true)
            ToastAndroid.show("Please fill correct online fee.", ToastAndroid.LONG);
            return
        }
        else if (offlineFee.trim().length === 0 || offlineFee.trim() == "0" || !onlyNo.test(offlineFee)) {
            seterror10(true)
            ToastAndroid.show("Please fill correct offline fee.", ToastAndroid.LONG);
            return
        }
        else {
            setLoading(true);
            const utility = new Utility();
            utility.checkNetwork()
                .then(() => {

                    const userData = {
                        doctorId: userAuthData.uid,
                        docRegistrationNo: doctorRegistrationNo.trim(),
                        email: email.trim(),
                        phoneNo: phoneNo.trim(),
                        name: name.trim(),
                        gender: gender.trim(),
                        dob: dob.toISOString(),
                        profilePictureUrl: "",
                        address: address.trim(),
                        landmark: landmark.trim(),
                        state: state.trim(),
                        city: city.trim(),
                        country: country.trim(),
                        pincode: pincode.trim(),
                        exprience: parseInt(exprience.trim()),
                        verified: false,
                        //verificationDocs:[],
                        operatorId: '',
                        specializations: doctorType.trim(),
                        //paymentDetails:[],
                        rating: {
                            noOfRatings: 1,
                            totalRating: 3
                        },
                        patientIds: [],
                        about: about,
                        status: true,
                        schedule: {
                            days: days,
                            maxAppointmentsPerSlot: parseInt(noOfPatients.trim()),
                            slots: slots
                        },
                        createdDate: firestore.Timestamp.now(),
                        fee: {
                            online: parseFloat(onlineFee.trim()),
                            offline: parseFloat(offlineFee.trim())
                        }
                    }

                    props.addDoctorDetails(userAuthData.uid, userData)
                        .then(() => {
                            setLoading(false);
                            ToastAndroid.show("Registration Sucessfull", ToastAndroid.LONG);
                            props.navigation.navigate("SetProfilePic");
                        })
                        .catch((err) => {
                            Alert.alert("Unable to register right now please try again later.")
                            setLoading(false);
                        });
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        }
        Keyboard.dismiss();
    }

    const removeSlot = (index) => {
        var tempList = slots
        tempList.splice(index, 1)
        console.log(tempList);
        setSlots(tempList)
        forceUpdate()
    }

    const addSlot = () => {
        var tempList = slots
        tempList.push({
            start: firestore.Timestamp.fromDate(fromTime),
            end: firestore.Timestamp.fromDate(toTime)
        })
        console.log(tempList);
        setSlots(tempList);
        giveReviewModal.current.close()
        forceUpdate()
    }

    if (dataGetPage === 1) {
        return (
            <>
                <View style={{ flex: 1, backgroundColor: "#fff" }}>
                    <Animatable.View style={styles.container} animation="slideInUp" duration={700} useNativeDriver={true}>
                        <KeyboardAwareScrollView enableOnAndroid={true} extraHeight={100} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                            <Button mode="contained" style={{ marginTop: 10, borderRadius: 15 }} icon="arrow-left-circle" contentStyle={{ height: 40 }} color="#e3f2fd" labelStyle={{ color: '#147efb', fontWeight: "bold" }} onPress={() => { setdataGetPage(0) }}>Back</Button>
                            <Title style={{ fontWeight: 'bold', marginTop: 10 }}>Professional Info</Title>
                            <Caption>Write about yourself to make your patients more comfortable.</Caption>
                            <TextInput
                                mode="outlined"
                                value={about}
                                error={error5}
                                placeholder="Write Little bit about yourself here..."
                                style={{ backgroundColor: "#fff", maxHeight: 180 }}
                                theme={{ colors: { primary: "#147EFB" } }}
                                numberOfLines={6}
                                label="About"
                                multiline={true}
                                onChangeText={text => {
                                    if (error5) {
                                        seterror5(false)
                                    }
                                    if (text.length <= 300) {
                                        setabout(text)
                                    }
                                    else {
                                        seterror5(true)
                                    }
                                }}
                                left={<TextInput.Icon name="doctor" color="#147efb" />}
                            />
                            <Caption style={{ alignSelf: "flex-end" }}>{about.length + "/300"}</Caption>

                            <TextInput
                                mode="outlined"
                                label="Experience*"
                                value={exprience}
                                onChangeText={(text) => {
                                    if (error6) {
                                        seterror6(false);
                                    }
                                    setexprience(text);
                                }}
                                onBlur={() => {
                                    if (exprience.length === 0) {
                                        seterror6(true);
                                        ToastAndroid.show("Experience  can\'t be null", ToastAndroid.LONG);
                                    }
                                    if (!onlyNo.test(exprience)) {
                                        seterror6(true)
                                        ToastAndroid.show("Experience can\'t be alphabets.", ToastAndroid.LONG);
                                    }
                                }}
                                error={error6}
                                placeholder="Experience as a doctor in yrs"
                                style={{ backgroundColor: "#fff", marginTop: 10 }}
                                theme={{ colors: { primary: "#147EFB" } }}
                                left={<TextInput.Icon name="shield-star" color="#147EFB" />}
                            />

                            <Subheading style={{ fontWeight: "bold", marginTop: 8 }}>Doctor Type/Specialization<Subheading style={{ color: 'red' }}>*</Subheading></Subheading>
                            <TextInput
                                mode="outlined"
                                label="Specialization*"
                                value={doctorType}
                                onChangeText={(text) => {
                                    if (error7) {
                                        seterror7(false);
                                    }
                                    setdoctorType(text);
                                }}
                                onBlur={() => {
                                    if (doctorType === '') {
                                        seterror7(true);
                                        ToastAndroid.show("Specialization can\'t be empty.", ToastAndroid.LONG);
                                        return
                                    }
                                }}
                                error={error7}
                                placeholder="Your Specialization here"
                                style={{ backgroundColor: "#fff" }}
                                theme={{ colors: { primary: "#147EFB" } }}
                                left={<TextInput.Icon name="file-star" color="#147EFB" />}
                            />

                            <Subheading style={{ fontWeight: "bold", marginTop: 8 }}>Availability Days</Subheading>
                            <Caption>Click below to change the Availability Days</Caption>
                            <TouchableOpacity style={styles.days} onPress={() => setShowDaysSelection(true)}>
                                {days.length === 0 ?
                                    <View style={{ flex: 1, justifyContent: 'center', padding: 10, }}>
                                        <Paragraph style={{ alignSelf: 'center', color: '#147efb', fontWeight: 'bold' }}>No days are selected</Paragraph>
                                    </View>
                                    :
                                    days.map(dayNo => {

                                        return (
                                            <View key={dayNo.toString()} style={{ flex: 1, justifyContent: 'center', padding: 10, }}>
                                                <Paragraph style={{ alignSelf: 'center', color: '#147efb', fontWeight: 'bold' }}>{allDays[dayNo]}</Paragraph>
                                            </View>
                                        )
                                    })}
                            </TouchableOpacity>

                            <Subheading style={{ fontWeight: "bold", marginTop: 8 }}>Slots</Subheading>
                            <Caption>Click the slots below to remove them.</Caption>

                            {slots.map((slot, index) => {
                                console.log(index);
                                return (
                                    <TouchableOpacity
                                        key={index.toString()}
                                        style={styles.slot}
                                        onPress={() => {
                                            Alert.alert(
                                                "Remove",
                                                `Are you sure you want to remove ${moment(slot.start.toDate()).format('hh:mm a') + " - " + moment(slot.end.toDate()).format('hh:mm a')} slot.`,
                                                [
                                                    {
                                                        text: "Cancel", style: "cancel"
                                                    },
                                                    { text: "OK", onPress: () => { removeSlot(index) } }
                                                ],
                                                { cancelable: false });
                                        }}
                                    >
                                        <Text style={{ color: "#147efb", fontWeight: 'bold', fontSize: 16 }}>{moment(slot.start.toDate()).format('hh:mm a') + " - " + moment(slot.end.toDate()).format('hh:mm a')}</Text>
                                    </TouchableOpacity>
                                )
                            })

                            }
                            <Button mode="outlined" style={{ marginTop: 10, borderRadius: 15, borderColor: "#147efb" }} icon="plus" contentStyle={{ height: 40 }} color="#147efb" labelStyle={{ color: '#147efb', fontWeight: "bold" }} onPress={() => { giveReviewModal.current.open() }}>Add new slot</Button>

                            <Subheading style={{ fontWeight: "bold", marginTop: 8 }}>No of patients in a slot</Subheading>
                            <TextInput
                                mode="outlined"
                                label="No of patients"
                                value={noOfPatients}
                                onChangeText={(text) => {
                                    if (error8) {
                                        seterror8(false);
                                    }
                                    setnoOfPatients(text);
                                }}
                                onBlur={() => {
                                    if (noOfPatients === "0") {
                                        seterror8(true)
                                        ToastAndroid.show("No of patients can\'t be Zero", ToastAndroid.LONG);
                                    }
                                    if (noOfPatients.length === 0) {
                                        seterror8(true)
                                        ToastAndroid.show("No of patients can\'t be empty", ToastAndroid.LONG);
                                    }
                                    if (!onlyNo.test(noOfPatients)) {
                                        seterror8(true)
                                        ToastAndroid.show("No of patients can\'t be alphabets.", ToastAndroid.LONG);
                                    }
                                }}
                                error={error8}
                                placeholder="No of patients in a slot"
                                style={{ backgroundColor: "#fff", }}
                                theme={{ colors: { primary: "#147EFB" } }}
                            />

                            <Title style={{ fontWeight: 'bold', marginTop: 10 }}>Consultancy Fee</Title>
                            <Caption>Fee for online appointments.</Caption>
                            <TextInput
                                mode="outlined"
                                label="Online Fee"
                                value={onlineFee}
                                onChangeText={(text) => {
                                    if (error9) {
                                        seterror9(false);
                                    }
                                    setonlineFee(text);
                                }}
                                onBlur={() => {
                                    if (onlineFee == "0") {
                                        seterror9(true)
                                        ToastAndroid.show("Online fee can\'t be Zero", ToastAndroid.LONG);
                                    }
                                    if (onlineFee.length === 0) {
                                        seterror9(true);
                                        ToastAndroid.show("Online fee can\'t be null", ToastAndroid.LONG);
                                    }
                                    if (!onlyNo.test(onlineFee)) {
                                        seterror9(true)
                                        ToastAndroid.show("Online fee can\'t be alphabets.", ToastAndroid.LONG);
                                    }
                                }}
                                error={error9}
                                placeholder="Your Online Fee"
                                style={{ backgroundColor: "#fff", }}
                                theme={{ colors: { primary: "#147EFB" } }}
                                left={<TextInput.Icon name="cash" color="#147EFB" />}

                            />
                            <Caption style={{ marginTop: 10 }}>Fee for offline appointments.</Caption>
                            <TextInput
                                mode="outlined"
                                label="Offline Fee"
                                value={offlineFee}
                                onChangeText={(text) => {
                                    if (error10) {
                                        seterror10(false);
                                    }
                                    setofflineFee(text);
                                }}
                                onBlur={() => {
                                    if (offlineFee == "0") {
                                        seterror10(true)
                                        ToastAndroid.show("Offline fee can\'t be Zero", ToastAndroid.LONG);
                                    }
                                    if (offlineFee.length === 0) {
                                        seterror10(true);
                                        ToastAndroid.show("Offline fee can\'t be null", ToastAndroid.LONG);
                                    }
                                    if (!onlyNo.test(offlineFee)) {
                                        seterror10(true)
                                        ToastAndroid.show("Offline Fee can\'t be alphabets.", ToastAndroid.LONG);
                                    }
                                }}
                                error={error10}
                                placeholder="Your Offline fee"
                                style={{ backgroundColor: "#fff", }}
                                theme={{ colors: { primary: "#147EFB" } }}
                                left={<TextInput.Icon name="cash" color="#147EFB" />}

                            />
                            <View style={{ marginBottom: 70 }} />

                        </KeyboardAwareScrollView>
                    </Animatable.View>

                    <Button mode="contained" loading={loading} style={styles.button} contentStyle={{ height: 45 }} color="#147EFB" onPress={() => { completeRegistration() }}>Complete Registration</Button>

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
                                        titleStyle={{ fontWeight: 'bold', color: sunday ? "#147efb" : "#000" }}
                                        style={styles.daysItem}
                                        right={() => <Checkbox.IOS status={sunday ? "checked" : "unchecked"} color="#147efb" />}
                                        onPress={() => setsunday(!sunday)}
                                    />
                                    <List.Item
                                        title="Monday"
                                        titleStyle={{ fontWeight: 'bold', color: monday ? "#147efb" : "#000" }}
                                        style={styles.daysItem}
                                        right={() => <Checkbox.IOS status={monday ? "checked" : "unchecked"} color="#147efb" />}
                                        onPress={() => setmonday(!monday)}
                                    />
                                    <List.Item
                                        title="Tuesday"
                                        titleStyle={{ fontWeight: 'bold', color: tue ? "#147efb" : "#000" }}
                                        style={styles.daysItem}
                                        right={() => <Checkbox.IOS status={tue ? "checked" : "unchecked"} color="#147efb" />}
                                        onPress={() => settue(!tue)}
                                    />
                                    <List.Item
                                        title="Wednesday"
                                        titleStyle={{ fontWeight: 'bold', color: wed ? "#147efb" : "#000" }}
                                        style={styles.daysItem}
                                        right={() => <Checkbox.IOS status={wed ? "checked" : "unchecked"} color="#147efb" />}
                                        onPress={() => setwed(!wed)}
                                    />
                                    <List.Item
                                        title="Thursday"
                                        titleStyle={{ fontWeight: 'bold', color: thu ? "#147efb" : "#000" }}
                                        style={styles.daysItem}
                                        right={() => <Checkbox.IOS status={thu ? "checked" : "unchecked"} color="#147efb" />}
                                        onPress={() => setthu(!thu)}
                                    />
                                    <List.Item
                                        title="Friday"
                                        titleStyle={{ fontWeight: 'bold', color: fri ? "#147efb" : "#000" }}
                                        style={styles.daysItem}
                                        right={() => <Checkbox.IOS status={fri ? "checked" : "unchecked"} color="#147efb" />}
                                        onPress={() => setfri(!fri)}
                                    />
                                    <List.Item
                                        title="Saturday"
                                        titleStyle={{ fontWeight: 'bold', color: sat ? "#147efb" : "#000" }}
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
                <Modalize
                    ref={giveReviewModal}
                    adjustToContentHeight={true}
                    modalStyle={styles.modal}
                    handleStyle={{ backgroundColor: '#147efb' }}
                    rootStyle={{ elevation: 10 }}
                    onClose={() => {

                    }}
                >
                    <Subheading style={{ fontWeight: "bold", marginTop: 8 }}>Starting Time</Subheading>
                    <Caption>Click to select starting time for new slot</Caption>
                    <Button onPress={() => setShowFromTime(true)} mode="contained" theme={{ colors: { primary: '#e3f2fd' } }} style={{ borderRadius: 15, marginTop: 5, marginBottom: 15, elevation: 5 }} contentStyle={{ height: 48 }} labelStyle={{ fontWeight: 'bold', color: '#147efb' }}>{`From: ${moment(fromTime).format("hh:mm a")}`}</Button>

                    <Subheading style={{ fontWeight: "bold", marginTop: 8 }}>Ending Time</Subheading>
                    <Caption>Click to select ending time for new slot</Caption>
                    <Button onPress={() => { setShowToTime(true) }} mode="contained" theme={{ colors: { primary: '#e3f2fd' } }} style={{ borderRadius: 15, marginTop: 5, marginBottom: 15, elevation: 5 }} contentStyle={{ height: 48 }} labelStyle={{ fontWeight: 'bold', color: '#147efb' }}>{`To: ${moment(toTime).format("hh:mm a")}`}</Button>

                    <View style={{ marginBottom: 15, marginTop: 20, flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                        <Button mode="outlined" theme={{ colors: { primary: 'red' } }} style={{ flex: 1, borderRadius: 15, marginRight: 5 }} contentStyle={{ height: 40 }} labelStyle={{ fontWeight: 'bold' }} onPress={() => giveReviewModal.current.close()}>cancel</Button>
                        <Button mode="contained" theme={{ colors: { primary: '#147efb' } }} style={{ flex: 1, borderRadius: 15, marginLeft: 5 }} contentStyle={{ height: 40 }} labelStyle={{ fontWeight: 'bold' }} onPress={addSlot}>ok</Button>
                    </View>
                </Modalize>
            </>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Animatable.View style={styles.container} animation="slideInUp" duration={700} useNativeDriver={true}>
                <KeyboardAwareScrollView enableOnAndroid={true} extraHeight={100} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                    <Paragraph style={{ marginTop: 20 }}>Please fill the below information to complete your account registration.</Paragraph>
                    <Title style={{ fontWeight: 'bold' }}>Account Info</Title>
                    <TextInput
                        mode="outlined"
                        label="Full Name*"
                        value={name}
                        onChangeText={(text) => { setName(text); }}
                        placeholder="Full name"
                        style={{ backgroundColor: "#fff", marginTop: 10 }}
                        theme={{ colors: { primary: "#147EFB" } }}
                        left={<TextInput.Icon name="account" color="#147EFB" />}
                        editable={false}
                    />
                    <TextInput
                        mode="outlined"
                        label="Email Address*"
                        value={email}
                        onChangeText={(text) => { setEmail(text); }}
                        placeholder="example@some.com"
                        style={{ backgroundColor: "#fff", marginTop: 10 }}
                        theme={{ colors: { primary: "#147EFB" } }}
                        left={<TextInput.Icon name="email" color="#147EFB" />}
                        editable={false}
                    />

                    <Title style={{ fontWeight: 'bold', marginTop: 10 }}>Personal Info</Title>

                    <TextInput
                        mode="outlined"
                        label="Doctor Registration No*"
                        value={doctorRegistrationNo}
                        onChangeText={(text) => {
                            if (error4) {
                                setError4(false);
                            }
                            setDoctorRegistrationNo(text);
                        }}
                        onBlur={() => {
                            if (doctorRegistrationNo === '') {
                                setError4(true);
                                ToastAndroid.show("Doctor Registration Number can\'t be empty.", ToastAndroid.LONG);
                                return
                            }
                        }}
                        error={error4}
                        placeholder="Doctor Registration Number here"
                        style={{ backgroundColor: "#fff", marginTop: 10 }}
                        theme={{ colors: { primary: "#147EFB" } }}
                        left={<TextInput.Icon name="card-account-details" color="#147EFB" />}
                    />
                    <Paragraph style={{}}>Please enter a vaild registration number it will be verified.</Paragraph>

                    <TextInput
                        mode="outlined"
                        label="Mobile Number*"
                        value={phoneNo}
                        onChangeText={(text) => {
                            if (error1) {
                                setError1(false);
                            }
                            setPhoneNo(text);
                        }}
                        onBlur={() => {
                            if (phoneNo.length < 10 || phoneNo.length > 10) {
                                setError1(true);
                                ToastAndroid.show("Mobile no can't be less or more than 10 digits", ToastAndroid.LONG);
                            }
                            if (!onlyNo.test(phoneNo)) {
                                setError1(true)
                                ToastAndroid.show("Mobile no can't have alphabets.", ToastAndroid.LONG);
                            }
                        }}
                        error={error1}
                        placeholder="Mobile Number here"
                        style={{ backgroundColor: "#fff", marginTop: 10 }}
                        theme={{ colors: { primary: "#147EFB" } }}
                        left={<TextInput.Icon name="phone" color="#147EFB" />}
                    />

                    <Subheading style={{ marginTop: 10, fontWeight: 'bold' }}>Gender</Subheading>

                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        <TouchableOpacity style={styles.radio} onPress={() => setGender('male')}>
                            <Text style={{ fontSize: 17, color: gender === "male" ? "#147efb" : "#000" }}>Male</Text>
                            <RadioButton.IOS
                                value="male"
                                status={gender === "male" ? "checked" : "unchecked"}
                                color="#147efb"
                                onPress={() => setGender('male')}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radio} onPress={() => setGender('female')}>
                            <Text style={{ fontSize: 17, color: gender === "female" ? "#147efb" : "#000" }}>Female</Text>
                            <RadioButton.IOS
                                value="female"
                                status={gender === "female" ? "checked" : "unchecked"}
                                color="#147efb"
                                onPress={() => setGender('female')}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radio} onPress={() => setGender('others')}>
                            <Text style={{ fontSize: 17, color: gender === "others" ? "#147efb" : "#000" }}>Others</Text>
                            <RadioButton.IOS
                                value="others"
                                status={gender === "others" ? "checked" : "unchecked"}
                                color="#147efb"
                                onPress={() => setGender('others')}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* <RadioButton.Group value={gender} onValueChange={(value) => setGender(value)}>
                        <RadioButton.Item
                            label="Male"
                            value="male"
                            uncheckedColor="#000"
                            color="#147efb"
                            style={styles.radio}
                            mode="ios"
                            labelStyle={{ color: gender === "male" ? "#147efb" : "#000" }}
                        />
                        <RadioButton.Item
                            label="Female"
                            value="female"
                            uncheckedColor="#000"
                            color="#147efb"
                            style={styles.radio}
                            mode="ios"
                            labelStyle={{ color: gender === "female" ? "#147efb" : "#000" }}
                        />
                        <RadioButton.Item
                            label="Others"
                            value="others"
                            uncheckedColor="#000"
                            color="#147efb"
                            style={styles.radio}
                            mode="ios"
                            labelStyle={{ color: gender === "others" ? "#147efb" : "#000" }}
                        />
                    </RadioButton.Group> */}

                    <Subheading style={{ marginTop: 10, fontWeight: 'bold' }}>DOB*</Subheading>
                    <Button mode='outlined' style={{ justifyContent: 'center' }} color="#000" onPress={() => { setShowDatePicker(true) }}>{moment(dob).format('Do MMMM YYYY')}</Button>

                    <Subheading style={{ marginTop: 10, fontWeight: 'bold' }}>Clinical Address</Subheading>
                    <Paragraph style={{}}>Address of you clinic or hospital for offline appointmets.</Paragraph>

                    <TextInput
                        mode="outlined"
                        label="Address*"
                        value={address}
                        onChangeText={(text) => {
                            if (error2) {
                                setError2(false);
                            }
                            setAddress(text);
                        }}
                        onBlur={() => {
                            if (address.length < 10) {
                                setError2(true)
                                ToastAndroid.show("Address can\'t be less than 10 letters.", ToastAndroid.LONG);
                            }
                        }}
                        error={error2}
                        placeholder="House No./Street Name"
                        style={{ backgroundColor: "#fff", marginTop: 10 }}
                        theme={{ colors: { primary: "#147EFB" } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Landmark"
                        value={landmark}
                        onChangeText={(text) => {
                            setLandmark(text);
                        }}
                        placeholder="Landmark near by(optional)"
                        style={{ backgroundColor: "#fff", marginTop: 10 }}
                        theme={{ colors: { primary: "#147EFB" } }}
                    />
                    <View style={{ flexDirection: 'row' }}>
                        <TextInput
                            mode="outlined"
                            label="City"
                            value={city}
                            onChangeText={(text) => {
                                setCity(text);
                            }}
                            placeholder="Your city"
                            style={{ flex: 1, backgroundColor: "#fff", marginTop: 10, marginRight: 5 }}
                            theme={{ colors: { primary: "#147EFB" } }}
                        />
                        <TextInput
                            mode="outlined"
                            label="State"
                            value={state}
                            onChangeText={(text) => {
                                setState(text);
                            }}
                            placeholder="Your State"
                            style={{ flex: 1, backgroundColor: "#fff", marginTop: 10, marginLeft: 5 }}
                            theme={{ colors: { primary: "#147EFB" } }}
                        />
                    </View>
                    <TextInput
                        mode="outlined"
                        label="Country"
                        value={country}
                        onChangeText={(text) => {
                            setCountry(text);
                        }}
                        placeholder="Your Country"
                        style={{ flex: 1, backgroundColor: "#fff", marginTop: 10, }}
                        theme={{ colors: { primary: "#147EFB" } }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Area Pincode*"
                        value={pincode}
                        onChangeText={(text) => {
                            if (error3) {
                                setError3(false);
                            }
                            setPincode(text);
                        }}
                        error={error3}
                        onBlur={() => {
                            if (pincode.length < 6 || pincode.length > 6 || !onlyNo.test(pincode)) {
                                setError3(true)
                                ToastAndroid.show("Enter a correct Pincode", ToastAndroid.LONG);
                            }
                        }}
                        placeholder="Your Area Pincode"
                        style={{ flex: 1, backgroundColor: "#fff", marginTop: 10, }}
                        theme={{ colors: { primary: "#147EFB" } }}
                    />

                    {/* <Subheading style={{marginTop:10,fontWeight:'bold'}}>User verification</Subheading> */}
                    <View style={{ marginBottom: 70 }} />
                </KeyboardAwareScrollView>
            </Animatable.View>
            <Button mode="contained" style={styles.button} icon="chevron-right-circle" contentStyle={{ height: 40 }} color="#147efb" onPress={() => { setdataGetPage(1) }}>Next</Button>
            {showDatePicker && (
                <DateTimePicker
                    testID="datePicker"
                    value={dob}
                    mode="date"
                    display='calendar'
                    onChange={(event, selectedDate) => {
                        if (event.type == 'set') {
                            setShowDatePicker(false);
                            setDob(selectedDate);
                        }
                        else {
                            setShowDatePicker(false);
                            return;
                        }
                    }}
                    onTouchCancel={() => setShowDatePicker(false)}


                />
            )}
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingHorizontal: 15
    },
    radio: {
        margin: 3,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        flex: 1,
        justifyContent: "space-between",
        alignItems: 'center',
        elevation: 1,
        padding: 5,
        paddingHorizontal: 10,
        flexDirection: "row"
    },
    button: {
        position: 'absolute',
        bottom: 10,
        left: 15,
        right: 15,
        borderRadius: 15,
        justifyContent: 'center'
    },
    days: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        // borderWidth: 1,
        // borderColor: '#b6b6b6',
        borderRadius: 15,
        elevation: 1
    },
    daysItem: {
        elevation: 1,
        backgroundColor: '#e3f2fd',
        borderRadius: 15,
        marginBottom: 12,
        // borderWidth: 1,
        borderColor: '#b6b6b6'
    },
    slot: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: "#e3f2fd",
        borderRadius: 10,
        margin: 5,
        display: 'flex',
        justifyContent: "center",
        alignItems: 'center',
        // borderColor: '#147efb',
        // borderWidth: 1,
        elevation: 1
    },
    modal: {
        backgroundColor: '#fff',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        padding: 15,
        paddingTop: 20
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(GetNewUserData);