import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, BackHandler, ToastAndroid, StyleSheet, Image, Alert, Keyboard } from 'react-native';
import { Button, List, Modal, Subheading, ActivityIndicator, Paragraph, RadioButton, TextInput, Title } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import * as Animatable from 'react-native-animatable';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { updateDoctorDetails } from '../redux/ActionCreators';

//redux
const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({
    updateDoctorDetails: (uid, updateData) => dispatch(updateDoctorDetails(uid, updateData)),
})

function ChangeEmail(props) {

    //states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error1, setError1] = useState(false);
    const [error2, setError2] = useState(false);
    const [showPass1, setShowPass1] = useState(false);
    const [loading, setLoading] = useState(false);

    //methods
    const regexEmail = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;

    const changeEmail = () => {
        if (email === '') {
            setError1(true);
            ToastAndroid.show("New Email can\'t be empty.", ToastAndroid.LONG);
            return;
        }
        else if (!regexEmail.test(email)) {
            setError1(true);
            ToastAndroid.show("Invalid email address.", ToastAndroid.LONG);
            return;
        }
        else if (password.length < 4 || password.length > 14) {
            setError2(true);
            ToastAndroid.show("Password must be minimum 4 and maximum 14 characters.", ToastAndroid.LONG);
            return;
        }
        else {
            const utility = new Utility();
            utility.checkNetwork()
                .then(() => {
                    Keyboard.dismiss();

                })
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar backgroundColor="#000" barStyle='light-content' />
            <Animatable.View animation="slideInUp" style={{ padding: 15 }} duration={400} useNativeDriver={true}>
                <Paragraph>
                    Your Current email is <Paragraph style={{ color: "#147efb" }}>{props.doctor.doctor.email}</Paragraph>
                </Paragraph>
                <Subheading style={{ fontWeight: "bold" }}>New Email<Subheading style={{ color: 'red' }}>*</Subheading></Subheading>
                <TextInput
                    mode="outlined"
                    label="New Email Address*"
                    value={email}
                    onChangeText={(text) => {
                        if (error1) {
                            setError1(false);
                        }
                        setEmail(text);
                    }}
                    onBlur={() => {
                        if (email === '') {
                            setError1(true);
                            ToastAndroid.show("New Email can\'t be empty.", ToastAndroid.LONG);
                            return;
                        }
                        else if (!regexEmail.test(email)) {
                            setError1(true);
                            ToastAndroid.show("Invalid email address.", ToastAndroid.LONG);
                            return;
                        }
                    }}
                    placeholder="example@some.com"
                    style={{ backgroundColor: "#fff", }}
                    theme={{ colors: { primary: "#147EFB" } }}
                    left={<TextInput.Icon name="email" color="#147EFB" />}
                    error={error1}
                    textContentType="emailAddress"
                />
                <Subheading style={{ fontWeight: "bold", marginTop: 10 }}>Confirmation Password<Subheading style={{ color: 'red' }}>*</Subheading></Subheading>
                <Paragraph>Enter your password to confirm email change.</Paragraph>
                <TextInput
                    mode="outlined"
                    label="Password*"
                    value={password}
                    onChangeText={(text) => {
                        if (error2) {
                            setError2(false);
                        }
                        setPassword(text);
                    }}
                    onBlur={() => {
                        if (password.length < 4 || password.length > 14) {
                            setError2(true);
                            ToastAndroid.show("Password must be minimum 4 and maximum 14 characters.", ToastAndroid.LONG);
                            return;
                        }
                    }}
                    placeholder="Password"
                    style={{ backgroundColor: "#fff", }}
                    theme={{ colors: { primary: "#147EFB" } }}
                    left={<TextInput.Icon name="lock" color="#147EFB" />}
                    right={<TextInput.Icon name={showPass1 ? "eye" : "eye-off"} color="#147EFB" onPress={() => setShowPass1(!showPass1)} />}
                    secureTextEntry={!showPass1}
                    error={error2}
                    textContentType="password"
                />

                <Button mode="contained" loading={loading} icon="email-sync" style={{ marginTop: 25 }} color="#147EFB" onPress={() => changeEmail()}>Change Email</Button>
            </Animatable.View>
        </View>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangeEmail);