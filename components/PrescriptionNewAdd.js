import React, { useState, useRef, useReducer } from 'react';
import { View, Text, StatusBar, ToastAndroid, Linking, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Paragraph, IconButton, Subheading, Button, Caption, ActivityIndicator, Title, TextInput } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Modalize } from 'react-native-modalize';
import Slider from '@react-native-community/slider';
import ShortId from 'shortid';

const PrescriptionNewView = (props) => {
    const [_, forceUpdate] = useReducer(x => x + 1, 0)

    //refs
    const modalizeRef = useRef(null);

    //states
    const [data, setData] = useState(props.route.params.data);
    const [note, setnote] = useState("");
    const [error1, setError1] = useState(false)
    const [medicienes, setmedicienes] = useState([])

    const [medName, setmedName] = useState('');
    const [error2, setError2] = useState(false)
    const [medDays, setmedDays] = useState(3);
    const [medRepeatsPerDay, setmedRepeatsPerDay] = useState(1)
    const [adding, setadding] = useState(false);

    //lifecycles

    //methods

    const addMed = () => {
        if (medName.trim() === "") {
            setError2(true);
            ToastAndroid.show("Mediciene name can\'t be empty.", ToastAndroid.LONG);
            return
        }
        else if (medDays <= 0) {
            ToastAndroid.show("Mediciene days can\'t be 0 or less.", ToastAndroid.LONG);
            return
        }
        else if (medRepeatsPerDay < 1) {
            ToastAndroid.show("Mediciene repeats can\'t be 0 or less.", ToastAndroid.LONG);
            return
        }
        else {
            const tempList = medicienes;
            tempList.push({
                medName: medName,
                medDays: medDays,
                noOfTimes: medRepeatsPerDay
            })

            setmedicienes(tempList);
            modalizeRef.current.close()
        }
    }

    const removeMed = (index) => {
        const tempList = medicienes;
        tempList.splice(index, 1);
        setmedicienes(tempList);
        forceUpdate();
    }

    const addPriscription = () => {
        if (medicienes.length < 1) {
            if (note.trim() === "") {
                ToastAndroid.show("Cant create prescription with no medicines or no notes", ToastAndroid.LONG)
                return
            }
        }

        setadding(true)

        const preData = {
            id: ShortId.generate(),
            note: note,
            date: firestore.Timestamp.now(),
            medicine: medicienes
        }

        const tempList = data.prescription
        tempList.push(preData)

        firestore().collection('appointments').doc(data.id).update({ prescription: tempList })
            .then(() => {
                setadding(false)
                props.navigation.goBack();
                ToastAndroid.show("Prescription Added", ToastAndroid.LONG)
            })
            .catch(err => {
                console.log(err);
                props.navigation.goBack();
                ToastAndroid.show("Unable to add prescription right now.", ToastAndroid.LONG)
                setadding(false)
            })

    }

    return (
        <>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <StatusBar backgroundColor="#fff" />
                <KeyboardAwareScrollView contentContainerStyle={{ padding: 15 }} enableOnAndroid={true} extraHeight={100} keyboardShouldPersistTaps='handled'>
                    <Animatable.View animation="slideInDown" duration={500} useNativeDriver={true}>
                        <View style={{ flexDirection: "row", justifyContent: 'space-between', alingItems: "center" }}>
                            <View>
                                <Paragraph style={{ fontWeight: 'bold' }}>Patient Name</Paragraph>
                                <Paragraph style={{ color: '#147efb' }}>{data.userData.name}</Paragraph>
                            </View>
                            <View>
                                <Paragraph style={{ fontWeight: 'bold' }}>Gender & Age</Paragraph>
                                <Paragraph style={{ color: '#147efb' }}>{data.userData.gender[0].toUpperCase() + "/" + moment().diff(new Date(data.userData.dob).toLocaleDateString(), 'years', false)}</Paragraph>
                            </View>
                        </View>
                        <View>
                            <Paragraph style={{ fontWeight: 'bold' }}>Problem</Paragraph>
                            <Caption>{data.problem}</Caption>
                        </View>

                        <View style={{ backgroundColor: "#e3f2fd", height: 1, marginTop: 10, marginBottom: 10 }} />
                        <Paragraph style={{ fontWeight: 'bold' }}>Note</Paragraph>
                        <TextInput
                            mode="flat"
                            value={note}
                            error={error1}
                            placeholder="Write note here if you want to "
                            style={{ backgroundColor: "#fff", maxHeight: 180, padding: 0 }}
                            theme={{ colors: { primary: "#147EFB" } }}
                            numberOfLines={6}
                            label="Note"
                            multiline={true}
                            onChangeText={text => {
                                if (error1) {
                                    setError1(false)
                                }
                                if (text.length <= 1000) {
                                    setnote(text)
                                }
                                else {
                                    setError1(true)
                                }
                            }}
                        />
                        <Caption style={{ alignSelf: "flex-end", marginBottom: 10 }}>{note.length + "/1000"}</Caption>
                        <View style={{ flexDirection: "row", justifyContent: 'flex-start', alingItems: "center", marginBottom: 10 }}>
                            <Image style={{ height: 30, width: 30 }} resizeMode="contain" source={require('../assets/rxLogo.png')} />
                            <Paragraph style={{ fontWeight: 'bold', fontSize: 16, marginLeft: 10 }}>Medicines</Paragraph>
                        </View>
                        {medicienes.length === 0 ?
                            <View style={{ justifyContent: 'center', alingItems: "center", flexDirection: 'row', paddingVertical: 10, }}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={25} color="#147efb" />
                                <Caption style={{ marginLeft: 5, alignSelf: "center" }}>No Medicines added yet</Caption>
                            </View>
                            :
                            <>
                                <Caption>Press medicine to remove it</Caption>
                                {medicienes.map((med, index) => {
                                    return (
                                        <TouchableOpacity key={index.toString()} style={styles.medCon} onPress={() => {
                                            Alert.alert(
                                                "Remove Medicine",
                                                `Are you sure you want to remove ${med.medName}`,
                                                [
                                                    {
                                                        text: "Cancel", style: "cancel"
                                                    },
                                                    { text: "OK", onPress: () => { removeMed(index) } }
                                                ],
                                                { cancelable: false });
                                        }}>
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

                                        </TouchableOpacity>
                                    )
                                })}

                            </>
                        }
                        <Button mode="contained" icon="plus" style={{ borderRadius: 15, marginBottom: 15 }} labelStyle={{ color: '#147efb' }} contentStyle={{ height: 40 }} color="#e3f2fd" onPress={() => { modalizeRef.current.open() }}>Add Medicine</Button>
                        <View style={{ flex: 1, height: 100 }} />
                    </Animatable.View>
                </KeyboardAwareScrollView>
                <Animatable.View animation="slideInUp" duration={500} useNativeDriver={true} style={{ ...styles.buttons, backgroundColor: "#e3f2fd" }}>
                    <Button loading={adding} mode="contained" icon="plus" style={{ flex: 1, borderRadius: 15 }} contentStyle={{ height: 48 }} color="#147EFB" onPress={() => { addPriscription() }}>Add Prescription</Button>
                </Animatable.View>
            </View>
            <Modalize
                ref={modalizeRef}
                adjustToContentHeight={true}
                modalStyle={styles.modal}
                handleStyle={{ backgroundColor: '#147efb' }}
                rootStyle={{ elevation: 10 }}
                onClose={() => {
                    setmedName('');
                    setmedDays(3);
                    setmedRepeatsPerDay(1);
                    setError2(false)
                }}
            >
                <Paragraph style={{ fontWeight: 'bold' }}>Medicine Name</Paragraph>

                <TextInput
                    mode='outlined'
                    value={medName}
                    onChangeText={(text) => {
                        if (error2) {
                            setError2(false);
                        }
                        setmedName(text);
                    }}
                    onBlur={() => {
                        if (medName.length == 0) {
                            setError2(true)
                            ToastAndroid.show("Medicine name can\'t be empty.", ToastAndroid.LONG);
                        }
                    }}
                    error={error2}
                    placeholder="Medicine name"
                    style={{ backgroundColor: "#fff", marginBottom: 10, borderRadius: 15 }}
                    theme={{ colors: { primary: "#147EFB" } }}
                />

                <Paragraph style={{ fontWeight: 'bold', alignSelf: "center", color: "#147efb" }}>Medicine Days</Paragraph>

                <View style={styles.numberRound}>
                    <Title style={{ color: '#147efb', fontWeight: 'bold' }} >{medDays}</Title>
                </View>
                <Slider
                    style={{ height: 40 }}
                    minimumValue={1}
                    maximumValue={30}
                    minimumTrackTintColor="#147efb"
                    maximumTrackTintColor="#000000"
                    key={"sdasdfada"}
                    thumbTintColor="#147efb"
                    onValueChange={e => setmedDays(e)}
                    step={1}
                    onSlidingComplete={value => { setmedDays(value) }}
                />
                <View style={{ backgroundColor: "#e3f2fd", height: 1, marginTop: 10, marginBottom: 10 }} />
                <Paragraph style={{ fontWeight: 'bold', alignSelf: "center", color: "#147efb" }}>Medicine Repetition Per Day</Paragraph>
                <View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", marginBottom: 15 }}>
                    <IconButton
                        icon="minus"
                        style={{ backgroundColor: '#eee', elevation: 2 }}
                        color="#147efb"
                        size={25}
                        onPress={() => {
                            if (medRepeatsPerDay - 1 < 1) {
                                return
                            }
                            else {
                                setmedRepeatsPerDay(medRepeatsPerDay - 1)
                            }

                        }}
                    />
                    <View style={styles.numberRound}>
                        <Title style={{ color: '#147efb', fontWeight: 'bold' }} >{medRepeatsPerDay}</Title>
                    </View>
                    <IconButton
                        icon="plus"
                        style={{ backgroundColor: '#eee', elevation: 2 }}
                        color="#147efb"
                        size={25}
                        onPress={() => {
                            setmedRepeatsPerDay(medRepeatsPerDay + 1)
                        }}
                    />
                </View>
                <Button mode="contained" icon="plus" style={{ borderRadius: 15, marginBottom: 20 }} contentStyle={{ height: 40 }} color="#147efb" onPress={() => { addMed() }}>Add Medicine</Button>

            </Modalize>
        </>
    )
};

const styles = StyleSheet.create({
    buttons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "row",
        padding: 15,
        // paddingTop: 20,
        backgroundColor: "#e3f2fd",
        elevation: 10,
        zIndex: 10,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    medCon: {
        paddingVertical: 7,
        // justifyContent: 'center',
        // alignItems: "flex-start",
        borderBottomWidth: 0.7,
        borderColor: "#147efb",
        marginBottom: 8
    },
    modal: {
        backgroundColor: '#fff',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 15,
    },
    numberRound: {
        borderRadius: 30,
        width: 60,
        height: 60,
        backgroundColor: '#e3f2fd',
        // elevation: 1,
        justifyContent: 'center',
        alignItems: "center",
        alignSelf: 'center',
    }
})

export default PrescriptionNewView;