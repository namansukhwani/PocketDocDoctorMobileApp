import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, TouchableOpacity } from 'react-native';
import { Avatar, Button, Headline, Caption, Paragraph, RadioButton, Subheading, TextInput, Title, Card } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import { Agenda } from 'react-native-calendars';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import LottieView from 'lottie-react-native';

const dataSchedule = [
    {
        name: "Janhavi Thakur",
        issue: "Knee Problem",
        mode: "online",
        time: new Date("11/21/2020 11:00 AM"),
        gender: 'F/20'
    },
    {
        name: "Manas Satpute",
        issue: "High blood pressure and headache",
        mode: "offline",
        time: new Date("11/21/2020 02:00 PM"),
        gender: 'M/20'
    },
    {
        name: "Anurag Sirothiya",
        issue: "High blood pressure and headache",
        mode: "offline",
        time: new Date("12/13/2020 02:00 PM"),
        gender: 'M/20'
    },
    {
        name: "Nidan Tegar",
        issue: "Knee Problem",
        mode: "online",
        time: new Date("11/29/2020 11:00 AM"),
        gender: 'M/20'
    },
    {
        name: "Rajdeep Kamat",
        issue: "High blood pressure and headache",
        mode: "offline",
        time: new Date("11/24/2020 02:00 PM"),
        gender: 'M/20'
    },
    {
        name: "Anurag Sirothiya",
        issue: "High blood pressure and headache",
        mode: "offline",
        time: new Date(),
        gender: 'M/20'
    },
    {
        name: "Nidan Tegar",
        issue: "Knee Problem",
        mode: "online",
        time: new Date("11/23/2020 11:00 AM"),
        gender: 'M/20'
    },
]

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
    const [items, setItems] = useState({});

    //lifecycles

    useFocusEffect(()=>{
        StatusBar.setBackgroundColor('#fff');
    })

    useEffect(() => {
        setData();
    }, [])

    //methods

    const timeToString = (time) => {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }

    const setData = () => {
        var newItems = {}
        dataSchedule.forEach(data => {
            var timeStr = timeToString(data.time);
            if (newItems[timeStr]) {
                newItems[timeStr].push(data);
            }
            else {
                newItems[timeStr] = [data];
            }
        })
        setItems(newItems);
        //console.log("data",newItems);
    }

    const renderItem = (item) => {
        return (
            <Animatable.View animation="slideInRight" style={{}} duration={500} useNativeDriver={true}>
                <TouchableOpacity style={styles.appointmentsToday}>
                    <Title numberOfLines={1}>{item.name}</Title>
                    <Caption style={{ paddingHorizontal: 0, paddingVertical: 0 }}>{item.gender}</Caption>
                    <Paragraph numberOfLines={1} style={{ overflow: "hidden", width: 210 }}><Paragraph style={{ fontWeight: "bold" }}>issue: </Paragraph>{item.issue}</Paragraph>
                    <Paragraph style={{ fontWeight: "bold" }}>Mode:</Paragraph>
                    <Subheading style={{ textTransform: 'uppercase', paddingHorizontal: 20, paddingVertical: 5, fontWeight: 'bold', borderRadius: 25, backgroundColor: '#fff', elevation: 3, alignSelf: 'flex-start' }}>{item.mode}</Subheading>
                    <View style={styles.todayTime}>
                        <Title style={{ alignSelf: "center", textAlign: "center", color: "#fff", textTransform: "uppercase" }}>{moment(item.time).format("hh:mm a")}</Title>
                    </View>
                </TouchableOpacity>
            </Animatable.View>
        );
    }

    const renderEmptyData = () => {
        return (
            <View style={{flex:1,justifyContent:'center',backgroundColor:"#fff"}}>
                <LottieView
                    source={require('../assets/relax_animation.json')}
                    autoPlay={true}
                    resizeMode='contain'
                    style={{ width: '70%', height: 260, alignSelf: 'center',backgroundColor:"#fff"}}
                    speed={1}
                />
                <Subheading style={{fontWeight:"bold",textAlign:'center'}}>No Appointments Today just relax!! </Subheading>
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
                items={items}
                //loadItemsForMonth={(day) => loadItems(day)}
                selected={new Date()}
                renderItem={(item) => renderItem(item)}
                renderEmptyData={()=>renderEmptyData()}
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
        elevation:1,
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