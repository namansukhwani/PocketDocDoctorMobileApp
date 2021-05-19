import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, BackHandler, ToastAndroid, StyleSheet, Image, Alert, Keyboard } from 'react-native';
import { Button, List, Modal, Subheading, ActivityIndicator, Paragraph, RadioButton, TextInput, Title } from 'react-native-paper';
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

function EditProfile(props) {
    //ref
    const modalizeRef = useRef(null);

    //state
    const [name, setName] = useState(props.doctor.doctor.name);
    const [phoneNo, setPhoneNo] = useState(props.doctor.doctor.phoneNo);
    const [gender, setGender] = useState(props.doctor.doctor.gender);
    const [dob, setDob] = useState(new Date(props.doctor.doctor.dob));
    const [address, setAddress] = useState(props.doctor.doctor.address);
    const [landmark, setLandmark] = useState(props.doctor.doctor.landmark);
    const [city, setCity] = useState(props.doctor.doctor.city);
    const [state, setState] = useState(props.doctor.doctor.state);
    const [country, setCountry] = useState(props.doctor.doctor.country);
    const [pincode, setPincode] = useState(props.doctor.doctor.pincode);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error1, setError1] = useState(false);
    const [error2, setError2] = useState(false);
    const [error3, setError3] = useState(false);
    const [error4, setError4] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

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

    function pickFromGallery() {
        ImagePicker.openPicker({
            width: 400,
            height: 400,
            compressImageQuality: 0.8,
            cropping: true,
            enableRotationGesture: true,
            mediaType: 'photo'
        })
            .then(image => {
                let filename = image.path.substring(image.path.lastIndexOf('/') + 1, image.path.length);
                uploadImage(image.path.slice(7), filename);
                // console.log("path:: ", image.path.slice(7));
                // console.log("path:: ", image.path);

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
            width: 400,
            height: 400,
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

    async function uploadImage(path, filename) {
        modalizeRef.current.close();
        const utility = new Utility();
        utility.checkNetwork()
            .then(() => {
                setUploading(true);
                const task = storage().ref().child('images/' + filename).putFile(path);

                task.on('state_changed', snapshot => {
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                }, (error) => {
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

                            const updateData = {
                                profilePictureUrl: url
                            }

                            props.updateDoctorDetails(auth().currentUser.uid, updateData)
                                .then(() => {
                                    console.log("Doctor data updated.");

                                    const batchUpdate = firestore().batch();

                                    firestore()
                                        .collection("chatRooms")
                                        .where('doctorId', '==', auth().currentUser.uid)
                                        .orderBy('lastUpdatedDate', 'desc')
                                        .get()
                                        .then(querySnapshot => {
                                            querySnapshot.docs.forEach(doc => {
                                                batchUpdate.update(doc.ref, {
                                                    doctorProfilePicUrl: url
                                                })
                                            });

                                            batchUpdate.commit().then(() => {
                                                console.log("batch update complete.");
                                            })
                                                .catch(err => { console.log("unable to bach update", err); });
                                        })
                                        .catch(err => console.log(err))

                                    setUploading(false);
                                })
                                .catch(err => {
                                    console.log(err);
                                    setUploading(false);
                                    Alert.alert("Unable to update your profile pic.")

                                })

                        })
                        .catch(err => {
                            console.log("url ::", err);
                            setUploading(false);
                        })

                })

            })
            .catch(err => { console.log(err); });
    }

    function updateProfile() {
        if (phoneNo.length < 10 || phoneNo.length > 10) {
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
        else if (getAge() < 20) {
            ToastAndroid.show("Minimum age to register is 14 years.", ToastAndroid.LONG);
        }
        else if (address.length < 10) {
            setError2(true)
            ToastAndroid.show("Address can\'t be less than 10 letters.", ToastAndroid.LONG);
        }
        else if (pincode.length < 6 || pincode.length > 6 || !onlyNo.test(pincode)) {
            setError3(true)
            ToastAndroid.show("Enter a correct Pincode", ToastAndroid.LONG);
        }
        else if (name === props.doctor.doctor.name && phoneNo === props.doctor.doctor.phoneNo && gender === props.doctor.doctor.gender && dob.getDate() === new Date(props.doctor.doctor.dob).getDate() && address === props.doctor.doctor.address && landmark === props.doctor.doctor.landmark && state === props.doctor.doctor.state && city === props.doctor.doctor.city && country === props.doctor.doctor.country && pincode === props.doctor.doctor.pincode) {
            ToastAndroid.show("No changes to update.", ToastAndroid.LONG);
            return;
        }
        else {
            setLoading(true);
            const utility = new Utility();
            utility.checkNetwork()
                .then(() => {

                    const updateData = {
                        phoneNo: phoneNo.trim(),
                        name: name.trim(),
                        gender: gender.trim(),
                        dob: dob.toISOString(),
                        address: address.trim(),
                        landmark: landmark.trim(),
                        state: state.trim(),
                        city: city.trim(),
                        country: country.trim(),
                        pincode: pincode.trim(),
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
                        <TouchableOpacity style={styles.avatar} onPress={() => modalizeRef.current?.open()}>
                            {props.doctor.doctor.profilePictureUrl === '' ?
                                null
                                :
                                <Image style={styles.image} source={{ uri: props.doctor.doctor.profilePictureUrl }} />
                            }
                            <View style={styles.filter} />
                            {uploading ?
                                <ActivityIndicator size='large' color='#fff' animating={true} style={{ alignSelf: 'center', position: 'absolute', zIndex: 10 }} />
                                :
                                <Icon name="camera" color="#fff" size={50} style={{ alignSelf: 'center', position: 'absolute', zIndex: 10 }} />
                            }
                        </TouchableOpacity>

                        <Title style={{ fontWeight: 'bold', marginTop: 10 }}>Personal Info</Title>

                        <TextInput
                            mode="outlined"
                            label="Full Name*"
                            value={name}
                            onChangeText={(text) => { setName(text); }}
                            placeholder="Full name"
                            style={{ backgroundColor: "#fff", marginTop: 10 }}
                            theme={{ colors: { primary: "#147EFB" } }}
                            left={<TextInput.Icon name="account" color="#147EFB" />}
                        />

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
                        <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-evenly" }}>
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
                        {/* <View style={{ flexDirection: "row" }}>
                            <RadioButton.Group value={gender} onValueChange={(value) => setGender(value)}>
                                <View style={{ flexDirection: 'row' }}>
                                    <RadioButton.Item
                                        label="Male"
                                        value="male"
                                        uncheckedColor="#000"
                                        color="#147efb"
                                        style={styles.radio}
                                    />
                                    <RadioButton.Item
                                        label="Female"
                                        value="female"
                                        uncheckedColor="#000"
                                        color="#147efb"
                                        style={styles.radio}
                                    />
                                    <RadioButton.Item
                                        label="Others"
                                        value="others"
                                        uncheckedColor="#000"
                                        color="#147efb"
                                        style={styles.radio}
                                    />
                                </View>
                            </RadioButton.Group>
                        </View> */}

                        <Subheading style={{ marginTop: 10, fontWeight: 'bold' }}>DOB*</Subheading>
                        <Button mode='outlined' style={{ justifyContent: 'center' }} color="#000" onPress={() => { setShowDatePicker(true) }}>{moment(dob).format('Do MMMM YYYY')}</Button>

                        <Subheading style={{ marginTop: 10, fontWeight: 'bold' }}>Clinical Address</Subheading>
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
                    </Animatable.View>
                </KeyboardAwareScrollView>

                <Button mode="contained" loading={loading} style={styles.button} contentStyle={{ height: 45 }} color="#147EFB" onPress={() => { updateProfile() }}>Confirm update</Button>

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

            <Modalize
                ref={modalizeRef}
                overlayStyle={{ backgroundColor: '#ffffff00' }}
                modalHeight={215}
                modalStyle={styles.modal}
                handleStyle={{ backgroundColor: '#000' }}
                rootStyle={{ elevation: 10 }}
            >
                <List.Section>
                    <List.Item style={{ ...styles.item }} title="Pick Image from Gallery" left={() => <List.Icon icon="image-plus" color="#147efb" />} onPress={() => pickFromGallery()} />
                    <List.Item style={styles.item} title="Capture New Image" left={() => <List.Icon icon="camera-plus" color="#147efb" />} onPress={() => captureImage()} />
                </List.Section>
                <Button mode="contained" color="#147efb" style={{ borderRadius: 15 }} onPress={() => modalizeRef.current.close()} >Cancel</Button>
            </Modalize>
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
        justifyContent: "space-between",
        alignItems: 'center',
        elevation: 1,
        padding: 5,
        paddingHorizontal: 10,
        flexDirection: "row"
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);