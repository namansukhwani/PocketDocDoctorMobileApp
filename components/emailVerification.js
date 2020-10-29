import React,{useEffect, useState} from 'react';
import {View,StyleSheet,StatusBar,Image,ToastAndroid} from 'react-native';
import {Button, Headline, Subheading,TextInput} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import auth from '@react-native-firebase/auth';
import Spinner from 'react-native-spinkit';

export default function EmailVerification(props){
    
    const [email, setEmail] = useState('')
    const [verified, setVerified] = useState(false);
    
    useEffect(()=>{
        
        if(auth().currentUser.emailVerified){
            props.navigation.navigate("home",{user:auth().currentUser.providerData});
        }
        else{
            setEmail(auth().currentUser.email);
            auth().currentUser.sendEmailVerification()
            .then(()=>{
                console.log("Email Sent");
                ToastAndroid.show("Email Verification Sent.",ToastAndroid.LONG);
                auth().currentUser.re
            })
            .catch(err=>{
                if(err.code==="auth/too-many-requests"){
                    ToastAndroid.show("We have blocked all requests from this device due to unusual activity. Try again later.",ToastAndroid.LONG)
                }
                console.log("error in sent mail :",err);
            });
        }
        
        const interval=setInterval(()=>{
                auth().currentUser.reload()
                .then(()=>{
                    console.log("User updated");
                        if(auth().currentUser.emailVerified){
                            setVerified(true);
                            setTimeout(()=>{
                                props.navigation.navigate("home",{user:auth().currentUser.providerData});
                            },2000);
                            clearInterval(interval);
                        }
                })
                .catch(err=>{
                    console.log(err);
                })
        },2000)
        
        return ()=> clearInterval(interval);
    },[])

    return(
        <View style={{flex:1,backgroundColor:"#fff"}}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            {verified ? 
                <View style={styles.container}>
                    <Image source={require('../assets/confirmed_icon.png')} style={{alignSelf:'center',width:70,height:70}} resizeMode="contain"/>
                    <Headline style={{fontSize:26,alignSelf:'center',fontWeight:"bold",color:"#147efb",marginTop:20}}>Verified</Headline>
                </View>
                :
                <Animatable.View style={styles.container} animation="slideInUp" duration={700} useNativeDriver={true}> 
                    <Headline style={{fontSize:26,alignSelf:'center',fontWeight:"bold",color:"#147efb",marginTop:20}}>Email Verification</Headline>
                    <Subheading style={{textAlign:"center",width:"85%",alignSelf:"center",marginTop:20}}>Email verification is sent on mail id <Subheading style={{color:'#147efb'}}>{email}</Subheading> Please verify your email address to continue.</Subheading>
                    <Spinner 
                        type="Wave"
                        color="#147efb98"
                        style={{alignSelf:"center",marginTop:25}}
                        isVisible={!verified}
                        size={70}
                    />
                    <Button 
                        mode="outlined" 
                        style={{width:190,alignSelf:'center',marginTop:30}} 
                        color="#147EFB" 
                        compact={true} 
                        onPress={()=>{
                            auth().currentUser.sendEmailVerification()
                            .then(()=>{
                                console.log("Email Sent");
                                ToastAndroid.show("Email Verification Sent.",ToastAndroid.LONG);
                            })
                            .catch(err=>{
                                console.log("error in sent mail :",err);
                            });
                        }}>
                            resend mail
                        </Button>
                </Animatable.View>
            }
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