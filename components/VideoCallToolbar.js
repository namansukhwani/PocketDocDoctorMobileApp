import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Headline, Button, Title, Avatar, IconButton, Paragraph } from 'react-native-paper';
import { connect } from 'react-redux';
import { Utility } from '../utility/utility';
import { } from '../redux/ActionCreators';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import ConnectyCube from 'react-native-connectycube';
import { CallService } from '../Services/videoCalling/CallService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ToolBarVideoCall(props) {

    //methods
    const MicOnOffButton = () => {
        return (
            <IconButton
                icon={props.mic? "microphone":"microphone-off"}
                style={{ backgroundColor: '#147efb' }}
                size={35}
                color='#fff'
                onPress={() => {  props.micOnOff()}}
            />
        )
    }

    const EndCallButton = () => {
        return (
            <IconButton
                icon="phone-hangup"
                style={{ backgroundColor: '#FF0000' }}
                size={35}
                color='#fff'
                onPress={() => { props.endCall() }}
            />
        )
    }

    const SwitchButton = () => {
        return (
            <IconButton
                icon="camera-retake"
                style={{ backgroundColor: '#1473fb' }}
                size={35}
                color='#fff'
                onPress={() => { props.switchCamera() }}
            />
        )
    }



    if (props.visible) {
        return (
            <View style={styles.container}>
                <View style={styles.toolBarItem}>
                    <MicOnOffButton/>
                </View>
                <View style={styles.toolBarItem}>
                    <EndCallButton/>
                </View>
                <View style={styles.toolBarItem}>
                    <SwitchButton/>
                </View>
            </View>
        );
    }

    return (
        <>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        height: 60,
        width:'100%',
        justifyContent: 'center',
        flexDirection: 'row',
        zIndex: 100,
    },
    toolBarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})