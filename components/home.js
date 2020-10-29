import React,{useState,useEffect} from 'react';
import {View,Text,StatusBar,Button, BackHandler, ToastAndroid,} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useBackHandler} from '@react-native-community/hooks';

export default function Home(props){

    const userData=props.route.params.user;
    const [backCount, setBackCount] = useState(0);

    useBackHandler(()=>{
        backCount===0 ? ToastAndroid.show('Press back to exit',ToastAndroid.SHORT) : BackHandler.exitApp();
        setBackCount(1);
        setTimeout(()=>{setBackCount(0)},3000)
        return true
    })
    
    console.log(userData);

    return(
        <View>
            <StatusBar backgroundColor="#fff" barStyle='dark-content' />
            <Text>{"Name : Dr. "+userData[0].displayName}</Text>
            <Text>{"Email : "+userData[0].email}</Text>
            <Button title="Sign out" onPress={()=>{auth().signOut();props.navigation.navigate("login")}} />
        </View>
    )
}