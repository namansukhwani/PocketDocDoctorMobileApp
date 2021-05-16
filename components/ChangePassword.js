import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, BackHandler, ToastAndroid, StyleSheet, Image, Alert, Keyboard } from 'react-native';
import { Button, List, Modal, Subheading, ActivityIndicator, Paragraph, RadioButton, TextInput, Title } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import * as Animatable from 'react-native-animatable';

import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';

export default function ChangePassword(props) {

    //states
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [reenterPassword, setReenterPassword] = useState('')
    const [error1, setError1] = useState(false);
    const [error2, setError2] = useState(false);
    const [error3, setError3] = useState(false);
    const [showPass1, setShowPass1] = useState(false);
    const [showPass2, setShowPass2] = useState(false);
    const [showPass3, setShowPass3] = useState(false);
    const [loading, setLoading] = useState(false);

    //methods
    const changePassword = () => {
        if (oldPassword === '') {
            setError3(true);
            ToastAndroid.show("Current password can\'t be empty.", ToastAndroid.LONG);
            return;
        }
        else if (password.length < 4 || password.length > 14) {
            setError1(true);
            ToastAndroid.show("Password must be minimum 4 and maximum 14 characters.", ToastAndroid.LONG);
            return;
        }
        else if (password !== reenterPassword) {
            setError2(true);
            ToastAndroid.show("Re-enter password doesn\'t match new password.", ToastAndroid.LONG);
            return;
        }
        else {
            const utility = new Utility();
            utility.checkNetwork()
                .then(() => {
                    Keyboard.dismiss();
                    setLoading(true);
                    const credential = auth.EmailAuthProvider.credential(
                        auth().currentUser.email,
                        oldPassword
                    );

                    auth().currentUser.reauthenticateWithCredential(credential)
                        .then(res => {
                            auth().currentUser.updatePassword(password)
                                .then((res) => {
                                    console.log(res);
                                    setLoading(false);
                                    ToastAndroid.show("Password changed Sucessfully.", ToastAndroid.LONG);
                                    props.navigation.goBack();
                                })
                                .catch(err => {
                                    console.log(err);
                                    setLoading(false);
                                })
                        })
                        .catch(err => {
                            console.log(err);
                            setOldPassword("");
                            ToastAndroid.show("Current Password you entered is incorrect. ", ToastAndroid.LONG);
                            setError3(true)
                            setLoading(false);
                        });
                })
                .catch(err => console.log(err))
        }
    }


    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar backgroundColor="#000" barStyle='light-content' />
            <Animatable.View animation="slideInUp" style={{ padding: 15 }} duration={400} useNativeDriver={true}>
                <Subheading style={{ fontWeight: "bold" }}>Current Password<Subheading style={{ color: 'red' }}>*</Subheading></Subheading>
                <TextInput
                    mode="outlined"
                    label="Current Password*"
                    value={oldPassword}
                    onChangeText={(text) => {
                        if (error3) {
                            setError3(false);
                        }
                        setOldPassword(text);
                    }}
                    onBlur={() => {
                        if (oldPassword === '') {
                            setError3(true);
                            ToastAndroid.show("Current password can\'t be empty.", ToastAndroid.LONG);
                            return;
                        }
                    }}
                    placeholder="Current Password"
                    style={{ backgroundColor: "#fff", }}
                    theme={{ colors: { primary: "#147EFB" } }}
                    left={<TextInput.Icon name="lock" color="#147EFB" />}
                    right={<TextInput.Icon name={showPass3 ? "eye" : "eye-off"} color="#147EFB" onPress={() => setShowPass3(!showPass3)} />}
                    secureTextEntry={!showPass3}
                    error={error3}
                    textContentType="password"
                />
                <Subheading style={{ fontWeight: 'bold', marginTop: 20 }}>New Password<Subheading style={{ color: 'red' }}>*</Subheading></Subheading>
                <TextInput
                    mode="outlined"
                    label="New Password*"
                    value={password}
                    onChangeText={(text) => {
                        if (error1) {
                            setError1(false);
                        }
                        setPassword(text);
                    }}
                    onBlur={() => {
                        if (password.length < 4 || password.length > 14) {
                            setError1(true);
                            ToastAndroid.show("Password must be minimum 4 and maximum 14 characters.", ToastAndroid.LONG);
                            return;
                        }
                    }}
                    placeholder="New Password"
                    style={{ backgroundColor: "#fff", }}
                    theme={{ colors: { primary: "#147EFB" } }}
                    left={<TextInput.Icon name="lock" color="#147EFB" />}
                    right={<TextInput.Icon name={showPass1 ? "eye" : "eye-off"} color="#147EFB" onPress={() => setShowPass1(!showPass1)} />}
                    secureTextEntry={!showPass1}
                    error={error1}
                    textContentType="password"
                />
                <TextInput
                    mode="outlined"
                    label="Re-enter New Password*"
                    value={reenterPassword}
                    onChangeText={(text) => {
                        if (error2) {
                            setError2(false);
                        }
                        setReenterPassword(text);
                    }}
                    onBlur={() => {
                        if (password !== reenterPassword) {
                            setError2(true);
                            ToastAndroid.show("Re-enter password doesn\'t match new password.", ToastAndroid.LONG);
                            return;
                        }

                    }}
                    placeholder="Re-enter new Password"
                    style={{ backgroundColor: "#fff", marginTop: 10 }}
                    theme={{ colors: { primary: "#147EFB" } }}
                    left={<TextInput.Icon name="lock-check" color="#147EFB" />}
                    right={<TextInput.Icon name={showPass2 ? "eye" : "eye-off"} color="#147EFB" onPress={() => setShowPass2(!showPass2)} />}
                    secureTextEntry={!showPass2}
                    error={error2}
                    textContentType="password"
                />
                <Button mode="contained" loading={loading} icon="refresh-circle" style={{ marginTop: 35,borderRadius:15 }} contentStyle={{height:45}} color="#147EFB" onPress={() => changePassword()}>Change password</Button>

            </Animatable.View>
        </View>
    );
}