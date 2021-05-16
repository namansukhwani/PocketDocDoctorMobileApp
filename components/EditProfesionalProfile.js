import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, BackHandler, ToastAndroid, StyleSheet, Image, Alert, Keyboard } from 'react-native';
import { Button, List, Caption, Subheading, ActivityIndicator, Paragraph, RadioButton, TextInput, Title } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { updateDoctorDetails } from '../redux/ActionCreators';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { Modalize } from 'react-native-modalize';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';


//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({
    updateDoctorDetails: (uid, updateData) => dispatch(updateDoctorDetails(uid, updateData))
})

function EditProfesionalProfile(props) {
    //ref
    const modalizeRef = useRef(null);

    //state
    const [docRegistrationId, setdocRegistrationId] = useState(props.doctor.doctor.docRegistrationNo);
    const [about, setabout] = useState(props.doctor.doctor.about);
    const [exprience, setexprience] = useState(props.doctor.doctor.exprience);
    const [doctorType, setdoctorType] = useState(props.doctor.doctor.specializations);
    const [onlineFee, setonlineFee] = useState(props.doctor.doctor.fee.online.toString());
    const [offlineFee, setofflineFee] = useState(props.doctor.doctor.fee.offline.toString())
    const [error1, setError1] = useState(false);
    const [error2, setError2] = useState(false);
    const [error3, setError3] = useState(false);
    const [error4, setError4] = useState(false);
    const [error5, setError5] = useState(false)
    const [loading, setLoading] = useState(false);

    //lifecycles

    //methods
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

    function updateProfile() {
        if (!onlyNo.test(exprience) || exprience.length === 0) {
            setError2(true)
            ToastAndroid.show("Please enter correct exprience.", ToastAndroid.LONG);
        }
        else if (doctorType.trim() === '') {
            setError3(true);
            ToastAndroid.show("Specialization can\'t be empty.", ToastAndroid.LONG);
        }
        else if (onlineFee.trim() == "0" || onlineFee.length === 0 || !onlyNo.test(onlineFee)) {
            setError4(true)
            ToastAndroid.show("Please enter a correct online fee", ToastAndroid.LONG);
        }
        else if (offlineFee.trim() == "0" || offlineFee.length === 0 || !onlyNo.test(offlineFee)) {
            setError5(true)
            ToastAndroid.show("Please enter a correct offline fee", ToastAndroid.LONG);
        }
        else if (about === props.doctor.doctor.about && exprience === props.doctor.doctor.exprience && doctorType === props.doctor.doctor.specializations && onlineFee === props.doctor.doctor.fee.online.toString() && offlineFee === props.doctor.doctor.fee.offline.toString()) {
            ToastAndroid.show("No changes to update.", ToastAndroid.LONG);
            return;
        }
        else {
            setLoading(true);
            const utility = new Utility();
            utility.checkNetwork()
                .then(() => {

                    const updateData = {
                        about: about,
                        exprience: exprience.trim(),
                        specializations: doctorType.trim(),
                        fee: {
                            online: parseInt(onlineFee.trim()),
                            offline: parseInt(offlineFee.trim())
                        }
                    }

                    props.updateDoctorDetails(auth().currentUser.uid, updateData)
                        .then(() => {
                            setLoading(false);
                            ToastAndroid.show("Profile sucessfully updated.", ToastAndroid.LONG);
                            props.navigation.goBack();
                        })
                        .catch((err) => {
                            Alert.alert("Unable to update profile right now please try again later.")
                            setLoading(false);
                            props.navigation.goBack();
                        });
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                })
            Keyboard.dismiss();
        }
    }

    return (
        <>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <StatusBar backgroundColor="#000" barStyle='light-content' />
                <KeyboardAwareScrollView enableOnAndroid={true} extraHeight={100} showsVerticalScrollIndicator={false} >
                    <Animatable.View animation="slideInUp" style={{ padding: 15 }} duration={400} useNativeDriver={true}>

                        <Title style={{ fontWeight: 'bold', marginTop: 10 }}>Professional Info</Title>

                        <TextInput
                            mode="outlined"
                            label="Doc Registration ID*"
                            value={docRegistrationId}
                            onChangeText={(text) => { setdocRegistrationId(text); }}
                            placeholder="Full name"
                            style={{ backgroundColor: "#fff", marginTop: 10, marginBottom: 10 }}
                            theme={{ colors: { primary: "#147EFB" } }}
                            left={<TextInput.Icon name="account" color="#147EFB" />}
                            editable={false}
                        />

                        <Caption>Write about yourself to make your patients more comfortable.</Caption>

                        <TextInput
                            mode="outlined"
                            value={about}
                            error={error1}
                            placeholder="Write Little bit about yourself here..."
                            style={{ backgroundColor: "#fff", maxHeight: 180 }}
                            theme={{ colors: { primary: "#147EFB" } }}
                            numberOfLines={6}
                            label="About"
                            multiline={true}
                            onChangeText={text => {
                                if (error1) {
                                    setError1(false)
                                }
                                if (text.length <= 300) {
                                    setabout(text)
                                }
                                else {
                                    setError1(true)
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
                                if (error2) {
                                    setError2(false);
                                }
                                setexprience(text);
                            }}
                            onBlur={() => {
                                if (exprience.length === 0) {
                                    setError2(true);
                                    ToastAndroid.show("Experience  can\'t be null", ToastAndroid.LONG);
                                }
                                if (!onlyNo.test(exprience)) {
                                    setError2(true)
                                    ToastAndroid.show("Experience can\'t be alphabets.", ToastAndroid.LONG);
                                }
                            }}
                            error={error2}
                            placeholder="Experience as a doctor in yrs"
                            style={{ backgroundColor: "#fff", marginTop: 10, marginBottom: 10 }}
                            theme={{ colors: { primary: "#147EFB" } }}
                            left={<TextInput.Icon name="shield-star" color="#147EFB" />}
                        />

                        <TextInput
                            mode="outlined"
                            label="Specialization*"
                            value={doctorType}
                            onChangeText={(text) => {
                                if (error3) {
                                    setError3(false);
                                }
                                setdoctorType(text);
                            }}
                            onBlur={() => {
                                if (doctorType === '') {
                                    setError3(true);
                                    ToastAndroid.show("Specialization can\'t be empty.", ToastAndroid.LONG);
                                    return
                                }
                            }}
                            error={error3}
                            placeholder="Your Specialization here"
                            style={{ backgroundColor: "#fff" }}
                            theme={{ colors: { primary: "#147EFB" } }}
                            left={<TextInput.Icon name="file-star" color="#147EFB" />}
                        />

                        <Title style={{ fontWeight: 'bold', marginTop: 10 }}>Consultancy Fee</Title>
                        <Caption>Fee for online appointments.</Caption>
                        <TextInput
                            mode="outlined"
                            label="Online Fee"
                            value={onlineFee}
                            onChangeText={(text) => {
                                if (error4) {
                                    setError4(false);
                                }
                                setonlineFee(text);
                            }}
                            onBlur={() => {
                                if (onlineFee == "0") {
                                    setError4(true)
                                    ToastAndroid.show("Online fee can\'t be Zero", ToastAndroid.LONG);
                                }
                                if (onlineFee.length === 0) {
                                    setError4(true);
                                    ToastAndroid.show("Online fee can\'t be null", ToastAndroid.LONG);
                                }
                                if (!onlyNo.test(onlineFee)) {
                                    setError4(true)
                                    ToastAndroid.show("Online fee can\'t be alphabets.", ToastAndroid.LONG);
                                }
                            }}
                            error={error4}
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
                                if (error5) {
                                    setError5(false);
                                }
                                setofflineFee(text);
                            }}
                            onBlur={() => {
                                if (offlineFee == "0") {
                                    setError5(true)
                                    ToastAndroid.show("Offline fee can\'t be Zero", ToastAndroid.LONG);
                                }
                                if (offlineFee.length === 0) {
                                    setError5(true);
                                    ToastAndroid.show("Offline fee can\'t be null", ToastAndroid.LONG);
                                }
                                if (!onlyNo.test(offlineFee)) {
                                    setError5(true)
                                    ToastAndroid.show("Offline Fee can\'t be alphabets.", ToastAndroid.LONG);
                                }
                            }}
                            error={error5}
                            placeholder="Your Offline fee"
                            style={{ backgroundColor: "#fff", }}
                            theme={{ colors: { primary: "#147EFB" } }}
                            left={<TextInput.Icon name="cash" color="#147EFB" />}

                        />
                    </Animatable.View>
                    <View style={{ marginBottom: 70 }} />

                </KeyboardAwareScrollView>
                <Button mode="contained" loading={loading} style={styles.button} contentStyle={{ height: 45 }} color="#147EFB" onPress={() => { updateProfile() }}>Confirm update</Button>

            </View>
        </>
    )
}

const styles = StyleSheet.create({
    avatar: {
        height: 130,
        width: 130,
        borderRadius: 65,
        elevation: 2,
        alignSelf: 'center',
        flex: 1,
        justifyContent: 'center',
        marginVertical: 20,
    },
    image: {
        resizeMode: 'cover',
        height: 130,
        width: 130,
        borderRadius: 65
    },
    filter: {
        position: 'absolute',
        flex: 1,
        backgroundColor: '#147efb50',
        height: 130,
        width: 130,
        borderRadius: 65,
    },
    modal: {
        backgroundColor: '#eeeeee',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        padding: 15
    },
    item: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 0,
        marginBottom: 10
    },
    button: {
        position: 'absolute',
        bottom: 10,
        left: 20,
        right: 20,
        justifyContent: 'center',
        borderRadius: 15,
        elevation: 7
    },
    radio: {
        margin: 3,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(EditProfesionalProfile);