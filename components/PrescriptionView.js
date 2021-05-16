import React, { useState, useRef, useReducer } from 'react';
import { View, Text, StatusBar, ToastAndroid, Linking, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Paragraph, IconButton, Subheading, Button, Caption, ActivityIndicator, Title, TextInput } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        doctor: state.doctor
    };
};

const mapDispatchToProps = (dispatch) => ({
})

const PrescriptionView = (props) => {

    //refs

    //states
    const [data, setData] = useState(props.route.params.data);
    const [preData, setpreData] = useState(props.route.params.pre)
    //lifecycles

    //methods

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar backgroundColor="#fff" />
            <KeyboardAwareScrollView contentContainerStyle={{ padding: 15 }} enableOnAndroid={true} extraHeight={100} keyboardShouldPersistTaps='handled'>
                <Animatable.View style={{ paddingTop: 35 }} animation="slideInDown" duration={500} useNativeDriver={true}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', alingItems: "center" }}>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Paragraph style={{ fontWeight: 'bold', fontSize: 18, color: '#147efb' }}>{props.doctor.doctor.name}</Paragraph>
                                {props.doctor.doctor.verified && <Image source={require('../assets/verefiedLogo.png')} style={{ marginLeft: 5, width: 20, height: 20, resizeMode: "contain" }} />}
                            </View>
                            <Caption style={{}}>{props.doctor.doctor.email}</Caption>
                            <Caption style={{}}>{"+91 " + props.doctor.doctor.phoneNo}</Caption>
                        </View>
                        <View style={{ justifyContent: "center", alignItems: 'center' }}>
                            <Image source={require('../assets/ic_launcher_round.png')} style={{ width: 45, height: 45, resizeMode: "contain" }} />
                            <Caption>Pocket Doc</Caption>
                        </View>
                    </View>

                    <View style={{ backgroundColor: "#e3f2fd", height: 1.2, marginTop: 10, marginBottom: 10 }} />

                    <View style={{ flexDirection: "row", justifyContent: 'space-between', alingItems: "center" }}>
                        <View>
                            <Paragraph style={{ fontWeight: "bold", marginBottom: 13 }}>{"ID: " + preData.id}</Paragraph>

                            <Caption style={{ fontWeight: 'bold', fontSize: 13 }}>Patient Name</Caption>
                            <Paragraph style={{ color: '#147efb' }}>{data.userData.name}</Paragraph>
                        </View>
                        <View>
                            <Paragraph style={{ fontWeight: "bold", marginBottom: 13 }}>{moment(preData.date.toDate()).format("DD/MM/YYYY")}</Paragraph>

                            <Caption style={{ fontWeight: 'bold', fontSize: 13 }}>Gender & Age</Caption>
                            <Paragraph style={{ color: '#147efb' }}>{data.userData.gender[0].toUpperCase() + "/" + moment(preData.date.toDate()).diff(new Date(data.userData.dob).toLocaleDateString(), 'years', false)}</Paragraph>
                        </View>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Caption style={{ fontWeight: 'bold', fontSize: 13 }}>Problem</Caption>
                        <Caption style={{ color: '#000' }}>{data.problem}</Caption>
                    </View>

                    <View style={{ backgroundColor: "#e3f2fd", height: 1, marginTop: 10, marginBottom: 10 }} />

                    {preData.note.length !== 0 && <Paragraph>{preData.note}</Paragraph>}

                    <View style={{ flexDirection: "row", justifyContent: 'flex-start', alingItems: "center", marginBottom: 10, marginTop: 15 }}>
                        <Image style={{ height: 30, width: 30 }} resizeMode="contain" source={require('../assets/rxLogo.png')} />
                        <Paragraph style={{ fontWeight: 'bold', fontSize: 16, marginLeft: 10 }}>Medicines</Paragraph>
                    </View>
                    {preData.medicine.length === 0 ?
                        <View style={{ justifyContent: 'center', alingItems: "center", flexDirection: 'row', paddingVertical: 10, }}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={25} color="#147efb" />
                            <Caption style={{ marginLeft: 5, alignSelf: "center" }}>No Medicines are prescribed</Caption>
                        </View>
                        :
                        <>
                            {preData.medicine.map((med, index) => {
                                return (
                                    <View key={index.toString()} style={styles.medCon} >
                                        <Title style={{ color: "#147efb", fontWeight: "bold", marginVertical: 0 }}><Title style={{ color: '#000', fontWeight: "bold" }}>{index + 1 + ". "}</Title>{med.medName}</Title>
                                        <View style={{ flexDirection: 'row', }}>
                                            {[...Array(med.noOfTimes)].map((item, index) => {
                                                return <MaterialCommunityIcons key={index.toString()} name="checkbox-blank-circle-outline" size={12} color="#4caf50" />
                                            })

                                            }
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>
                                            <Caption style={{ fontWeight: "bold", }}>No of times a day : <Caption style={{ color: '#000' }}>{med.noOfTimes}</Caption></Caption>
                                            <Title style={{ marginVertical: 0 }}>{med.medDays + " Days"}</Title>
                                        </View>

                                    </View>
                                )
                            })}

                        </>
                    }
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', alingItems: "center", marginTop: 30, marginBottom: 10 }}>
                        <View style={{ alignSelf: "center" }}>
                            <Caption style={{ fontWeight: 'bold', fontSize: 13 }}>Signed by</Caption>
                            <Paragraph style={{}}>{props.doctor.doctor.name}</Paragraph>
                        </View>
                        <View style={{ justifyContent: "center", alignItems: 'center' }}>
                            <Image source={require('../assets/verifiedMark.png')} style={{ width: 85, height: 85, resizeMode: "contain" }} />
                        </View>
                    </View>
                </Animatable.View>
            </KeyboardAwareScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    medCon: {
        paddingVertical: 7,
        // justifyContent: 'center',
        // alignItems: "flex-start",
        borderBottomWidth: 0.7,
        borderColor: "#147efb",
        marginBottom: 8
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(PrescriptionView);