import React from 'react';
import {Alert, TouchableOpacity,ToastAndroid} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {} from '@react-navigation/bottom-tabs';
import Login from './login';
import Home from './home';
import SignUp from './signUp';
import ForgotPassword from './forgotPassword';
import Icon from 'react-native-vector-icons/Ionicons';
import GetNewUserData from './getNewUserData';
import EmailVerification from './emailVerification';
import auth from '@react-native-firebase/auth';

const Stack=createStackNavigator();

export default function Main(){
    return(
        <NavigationContainer>
            <Stack.Navigator initialRouteName="login">
                <Stack.Screen
                    name="login"
                    options={{
                        title:'Login',
                        headerTitleAlign:'center',
                        headerShown:false
                    }}
                    component={Login}
                />
                <Stack.Screen
                    name="signUp"
                    options={({route,navigation})=>({
                        title:"Home",
                        headerTitleAlign:'center',
                        headerShown:false
                    })}
                    component={SignUp}
                />
                <Stack.Screen
                    name="getNewUserData"
                    options={({route,navigation})=>({
                        //headerShown:false,
                        headerTitle:'',
                        headerTransparent:true,
                        headerTitleAlign:'center',
                        headerLeft:()=>(
                            <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center',marginLeft:10}} onPress={()=>navigation.goBack()}>
                                <Icon name="chevron-back" size={30} onPress={()=>navigation.goBack()} />
                            </TouchableOpacity>
                        ),
                    })}
                    component={GetNewUserData}
                />
                <Stack.Screen
                    name="emailVerification"
                    options={({route,navigation})=>({
                        //headerShown:false,
                        headerTitle:'Verification',
                        headerTransparent:true,
                        headerTitleAlign:'center',
                        headerLeft:()=>(
                            <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center',marginLeft:10}} onPress={()=>navigation.goBack()}>
                                <Icon 
                                    name="chevron-back" 
                                    size={30} 
                                    onPress={()=>{
                                        Alert.alert( 
                                            "Go Back",
                                            "Are you sure you want to sign out.",
                                            [
                                                {
                                                text: "Cancel",style: "cancel"},
                                                { text: "GO BACK", onPress: () =>{auth().signOut().then(()=>console.log("singed out")).catch(err=>console.log(err));navigation.goBack()}}
                                            ],
                                            { cancelable: false });
                                        //ToastAndroid.show("You can verify your mail anytime.")
                                        }}
                                        />
                            </TouchableOpacity>
                        ),
                    })}
                    component={EmailVerification}
                />
                <Stack.Screen
                    name="forgotPassword"
                    options={({route,navigation})=>({
                        headerTitle:'',
                        headerTransparent:true,
                        headerTitleAlign:'center',
                        headerLeft:()=>(
                            <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center',marginLeft:10}} onPress={()=>navigation.goBack()}>
                                <Icon name="chevron-back" size={30} onPress={()=>navigation.goBack()} />
                            </TouchableOpacity>
                        ),
                    })}
                    component={ForgotPassword}
                />
                <Stack.Screen
                    name="home"
                    options={({route,navigation})=>({
                        title:"Home",
                        headerTitleAlign:'center',
                        headerLeft:null
                    })}
                    component={Home}
                />
                
            </Stack.Navigator>
        </NavigationContainer>
    )
}