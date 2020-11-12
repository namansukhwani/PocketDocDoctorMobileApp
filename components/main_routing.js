import React from 'react';
import {Alert, TouchableOpacity,ToastAndroid} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Login from './login';
import Home from './home';
import SignUp from './signUp';
import ForgotPassword from './forgotPassword';
import Icon from 'react-native-vector-icons/Ionicons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import ComunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import GetNewUserData from './getNewUserData';
import EmailVerification from './emailVerification';
import auth from '@react-native-firebase/auth';
import SetProfilePic from './SetProfilePic';
import AllChats from './AllChats';
import Chat from './Chat';

const Stack=createStackNavigator();
const Tab=createBottomTabNavigator();

function BottomDrawer(props){

    return(
        <Tab.Navigator 
            tabBarOptions={{
                activeTintColor:'#147efb',
                keyboardHidesTabBar:true,
                
            }} 
            screenOptions={{
                unmountOnBlur:true
            }}
            initialRouteName="userHome"
        >
            <Tab.Screen
                name="userHome"
                component={Home}
                options={{
                    tabBarLabel:'Home',
                    tabBarIcon:({color,size})=><AntIcon name="home" color={color} size={size} />
                }}
            />
            {/* <Tab.Screen
                name="Appointments"
                component={Appointments}
                options={({route,navigation})=>({
                    tabBarLabel:'Appointments',
                    tabBarIcon:({color,size})=><ComunityIcon name="calendar-plus" color={color} size={size} />,
                })}
            /> */}
            <Tab.Screen
                name="AllChats"
                component={AllChats}
                options={({route,navigation})=>({
                    tabBarLabel:'Chats',
                    tabBarIcon:({color,size})=><MaterialIcon name="chat" color={color} size={size} />,
                })}
            />
            {/* <Tab.Screen
                name="Settings"
                component={Settings}
                options={({route,navigation})=>({
                    tabBarLabel:'Settings',
                    tabBarIcon:({color,size})=><MaterialIcon name="settings" color={color} size={size} />,
                })}
            /> */}
        </Tab.Navigator>
    )
}

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
                        headerTitle:'Your Information',
                        //headerTransparent:true,
                       
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
                    name="SetProfilePic"
                    options={({route,navigation})=>({
                        headerTitle:'Profile Picture',
                        headerTitleAlign:'center',
                        headerLeft:()=>(null),
                        headerStyle:{
                            elevation:0
                        }
                    })}
                    component={SetProfilePic}
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
                        headerLeft:null,
                        headerShown:false
                    })}
                    component={BottomDrawer}
                />
                
                
                <Stack.Screen
                    name="Chat"
                    options={({route,navigation})=>({
                        headerShown:false
                    })}
                    component={Chat}
                />

            </Stack.Navigator>
        </NavigationContainer>
    )
}