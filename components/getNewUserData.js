import React,{useEffect, useState} from 'react';
import {View,StyleSheet,StatusBar,Image,ToastAndroid} from 'react-native';
import {Button, Headline, Subheading,TextInput} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import auth from '@react-native-firebase/auth';
import Spinner from 'react-native-spinkit';

export default function GetNewUserData(props){
    
    const [email, setEmail] = useState('')
    const [verified, setVerified] = useState(false);

    return(
        <View style={{flex:1,backgroundColor:"#fff"}}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Animatable.View style={styles.container} animation="slideInUp" duration={700} useNativeDriver={true}> 
                <Headline style={{alignSelf:"center"}}>Get New User Data</Headline>
            </Animatable.View>
         </View>

    )

} 

const styles=StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#fff',
        justifyContent:'center',
        padding:20,
    },
    footer:{
        position:'absolute',
        bottom:0,
        left:0,
        right:0,
    },
})