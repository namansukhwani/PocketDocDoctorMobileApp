import React,{useEffect, useState} from 'react';
import {View,StyleSheet,StatusBar,Image,ToastAndroid} from 'react-native';
import {Button, Headline, Subheading,TextInput} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import auth from '@react-native-firebase/auth';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ForgotPassword(props){
    
    const [email, setEmail] = useState(props.route.params.email);
    const [error1, setError1] = useState(false);

    function handelReset(){
        const regexEmail=/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;

        if(email===''){
            setError1(true);
            ToastAndroid.show("Email field can\'t be empty.",ToastAndroid.LONG);
            return;
        }
        if(!regexEmail.test(email)){
            setError1(true);
            ToastAndroid.show("Invalid email address.",ToastAndroid.LONG);
            return;
        }

        auth().sendPasswordResetEmail(email)
        .then(()=>{
            ToastAndroid.show("Email Sent",ToastAndroid.LONG);
            console.log("done");
            setTimeout(()=>{
                props.navigation.navigate('login');
            },300)
        })
        .catch(error=>{
            if (error.code === 'auth/invalid-email') {
                console.log('That email address is invalid!');
                ToastAndroid.show("That email address is invalid!",ToastAndroid.LONG);
            }
            if (error.code === 'auth/user-not-found') {
                console.log('This email is not registered!');
                ToastAndroid.show("This email is not registered!",ToastAndroid.LONG);
            }
            console.log(error);
        })
    }

    return(
        <View style={{flex:1,backgroundColor:"#fff"}}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
                <Animatable.View style={styles.container} animation="slideInUp" duration={700} useNativeDriver={true}>
                <Icon style={{alignSelf:'center'}} name="lock-reset" size={90} color="#147EFB" />
                <Headline style={{fontSize:26,alignSelf:'center',fontWeight:"bold",color:"#147efb",marginTop:20}}>Forgot Password?</Headline>
                <Subheading style={{marginTop:8,textAlign:'center',width:"80%",alignSelf:'center'}}>We just need your registered email address to sent you password reset.</Subheading>
                <TextInput
                    mode="outlined"
                    label="Email Address*"
                    value={email}
                    onChangeText={(text)=>{
                        if(error1){
                            setError1(false);
                        }
                        setEmail(text);
                    }}
                    placeholder="example@some.com"
                    style={{backgroundColor:"#fff",marginTop:30}}
                    theme={{colors:{primary:"#147EFB"}}}
                    left={<TextInput.Icon name="email" color="#147EFB"/>}
                    error={error1}
                />
                <Button mode="contained" style={{marginTop:35,borderRadius:15,justifyContent:'center',marginBottom:'14%'}} contentStyle={{height:50}} color="#147EFB" onPress={()=>handelReset()}>Send password Reset</Button>
                </Animatable.View>
                <View style={styles.footer}>
                    <Subheading style={{alignSelf:"center",margin:10}} >Don't have an account ?</Subheading>
                    <Button mode="text" style={{width:90,alignSelf:"center",marginBottom:10}} color="#147EFB" compact={true} onPress={()=>props.navigation.navigate("signUp")}>REGISTER</Button> 
                </View>
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