import React,{useEffect, useState} from 'react';
import {View,StyleSheet,StatusBar,Image,ToastAndroid, Alert,Animated} from 'react-native';
import {Button, Headline,Subheading,TextInput} from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Animatable from 'react-native-animatable';
import auth from '@react-native-firebase/auth';
import {Utility} from '../utility/utility';
import {connect} from 'react-redux';
import {getDoctorDetails} from '../redux/ActionCreators';
import LoadingScreen from './loadingScreen';

//redux
const mapStateToProps=state =>{
    return{
        doctor:state.doctor
    };
};

const mapDispatchToProps=(dispatch) => ({
    getDoctorDetails:(uid)=>dispatch(getDoctorDetails(uid)),
})

//component
function Login(props){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error1, setError1] = useState(false)
    const [error2, setError2] = useState(false)
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [checkingLogin, setCheckingLogin] = useState(true);

    //lifecycle
    useEffect(()=>{

        const userChangeListner=auth().onAuthStateChanged((user)=>{
            //console.log(user);
            
                if(user!==null){
                    const utility=new Utility();
                    utility.checkNetwork()
                    .then(()=>{
                        auth().currentUser.reload()
                        .then((user)=>{
                            global.doctorAuthData=auth().currentUser;   
                        })
                        .catch(err=>console.log(err))
                        if(user.photoURL==="doctor"){
                            if(user.emailVerified){
                                checkDoctorData(user.uid,true);
                            }
                            else{
                                setLoading(false);  
                                props.navigation.navigate("emailVerification");
                            }
                            
                        }
                    })
                    .catch((err)=>{
                        console.log(err);
                        if(props.doctor.available){
                            setCheckingLogin(false);
                            props.navigation.navigate("home");
                        }
                    })
                }

            //console.log(auth().currentUser.emailVerified)
        })

        return userChangeListner;
    },[]);

    //methods
    const checkDoctorData=(uid,first)=>{
        props.getDoctorDetails(uid)
        .then(()=>{
           
            if(first){
                setCheckingLogin(false);
            }
            else{
                setLoading(false);
                setEmail('');
                setPassword('');
            }
            props.navigation.navigate("home");
        
        })
        .catch((err)=>{
            if(err.status){
                if(first){
                    setCheckingLogin(false);
                }
                else{
                    setLoading(false);
                    setEmail('');
                    setPassword('');
                }
                
                props.navigation.navigate("getNewUserData");
                
            }
            setCheckingLogin(false);
            console.log('Error APi: ',err);
        })
        
    }

    const handelLogin=()=>{
        setLoading(true);
        const regexEmail=/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;

        if(email===''){
            setError1(true);
            ToastAndroid.show("Email field can\'t be empty.",ToastAndroid.LONG);
            setLoading(false);
            return;
        }
        if(!regexEmail.test(email)){
            setError1(true);
            ToastAndroid.show("Invalid email address.",ToastAndroid.LONG);
            setLoading(false);
            return;
        }
        if(password.length < 4 || password.length > 14){
            setError2(true);
            ToastAndroid.show("Password must be minimum 4 and maximum 14 characters.",ToastAndroid.LONG);
            setLoading(false);
            return;
        } 

        const utility=new Utility();
        utility.checkNetwork()
        .then(()=>{
            auth()
            .signInWithEmailAndPassword(email,password)
            .then((user) => {
                global.doctorAuthData=user.user;
                console.log('User account signed in!');
                console.log("User :",user.user.email);
                if(user.user.photoURL!=="doctor"){
                    setLoading(false);
                    auth().signOut()
                    .then(()=>{
                        if(user.user.photoURL==="user"){
                            Alert.alert("This is a user account. This app is only for doctors. For user use PocketDoc");
                            console.log("This is a user ID");
                        }
                        if(user.user.photoURL==="hospital"){
                            Alert.alert("This is a oprator account. This app is only for doctors. For operator login use PocketDoc Website.");
                            console.log("This is a hospital ID");
                        }
                        
                        return;
                    })
                    .catch(err=>console.log("logout ERROR"))
                    return;
                }
                else{
                    user.user.getIdToken()
                    .then(token=>{
                        console.log("Token ::: ",token)
                    })
                    .catch(err=>{
                        console.log("error in token :",err);
                    })
                    
                    if(user.user.emailVerified){
                        checkDoctorData(user.user.uid,false);
                    }
                    else{
                        setEmail('');
                        setPassword('');
                        setLoading(false);
                        props.navigation.navigate("emailVerification");
                    }
                    //props.navigation.navigate("home",{user:user.user.providerData});
                }
            
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    console.log('That email address is already in use!');
                    ToastAndroid.show("That email address is already in use!",ToastAndroid.LONG);
        
                }

                if (error.code === 'auth/invalid-email') {
                    console.log('That email address is invalid!');
                    ToastAndroid.show("That email address is invalid!",ToastAndroid.LONG);
            
                }

                if (error.code === 'auth/user-not-found') {
                    console.log('User with this email dosent exist');
                    ToastAndroid.show("User with this email dosent exist",ToastAndroid.LONG);
                
                }

                if (error.code === 'auth/wrong-password') {
                    console.log('Password is incorrect');
                    ToastAndroid.show("Password is incorrect",ToastAndroid.LONG);
                    
                }
                setLoading(false);
                console.log(error);
            });
        })
        .catch(err=>{console.log(err);setCheckingLogin(false);setLoading(false);});
    };

    if(checkingLogin){
        return(
            <LoadingScreen backgroundColor="#fff" color="#147EFB"/>
        )
    }
    return(
        <View style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <View style={styles.con} >
                <Headline style={styles.heading}>Welcome Doctor!!</Headline>
                <Subheading style={{color:'#000'}}><Subheading style={{color:'#000',fontWeight:'bold'}}>Pocket Doc </Subheading>is a complete solution for your appointments and patient's managment .</Subheading>
                <Animatable.View animation="slideInUp" duration={700} delay={150} useNativeDriver={true}>
                    <KeyboardAwareScrollView enableOnAndroid={true} extraHeight={58} style={{backgroundColor:"#fff"}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                        <View style={{width:'100%',height:"100%",flex:1}}>
                        <Image source={require('../assets/login_icon.png')} style={{width:120,height:120,resizeMode:"contain",alignSelf:'center'}} />
                        <Headline style={styles.loginText}>Login</Headline>
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
                            style={{backgroundColor:"#fff",marginTop:10}}
                            theme={{colors:{primary:"#147EFB"}}}
                            left={<TextInput.Icon name="account" color="#147EFB"/>}
                            error={error1}
                        />
                        <TextInput
                            mode="outlined"
                            label="Password*"
                            value={password}
                            onChangeText={(text)=>{
                                if(error2){
                                    setError2(false);
                                }
                                setPassword(text);
                            }}
                            placeholder="Password"
                            style={{backgroundColor:"#fff",marginTop:10}}
                            theme={{colors:{primary:"#147EFB"}}}
                            left={<TextInput.Icon name="lock" color="#147EFB"/>}
                            right={<TextInput.Icon name={showPass ? "eye" : "eye-off"} color="#147EFB" onPress={()=>setShowPass(!showPass)} />}
                            secureTextEntry={!showPass}
                            error={error2}
                        />
                        <Button mode="text" style={{width:190,alignSelf:'center'}} color="#147EFB" compact={true} onPress={()=>props.navigation.navigate("forgotPassword",{email:email})}>Forgot Password?</Button>
                        <Button mode="contained" loading={loading} icon="arrow-right-circle" style={{marginTop:35}} color="#147EFB" onPress={()=>handelLogin()}>LOGIN</Button>
                        </View>
                        <View style={styles.footer}>
                            <Subheading style={{alignSelf:"center",margin:10}} >Don't have an account ?</Subheading>
                            <Button mode="text" style={{width:90,alignSelf:"center",marginBottom:10}} color="#147EFB" compact={true} onPress={()=>props.navigation.navigate("signUp")}>REGISTER</Button>   
                        </View>
                    </KeyboardAwareScrollView>
                    {/*<View style={styles.loginButton}>
                        <IconButton
                            icon="arrow-right-circle"
                            color="#fff"
                            size={55}
                            style={{alignSelf:'center'}}
                            onPress={()=>console.log("hello")}
                        />
                    </View>*/}
                    
                </Animatable.View>
                
            </View>
        </View>
    )
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#fff',
    },
    card:{
        backgroundColor:"#fff",
        height:450,
        marginTop:20,
        elevation:10,
        borderRadius:10,
        zIndex:10,
        padding:10
    },
    con:{
        flex:1,
        padding:20
    },
    heading:{
        color:"#000",
        fontSize:30,
        marginTop:"6%",
        fontWeight:'bold'
    },
    loginText:{
        color:"#147EFB",
        alignSelf:'center',
        padding:5,
        fontWeight:'bold',
        borderColor:"#147EFB",
        borderBottomWidth:3
    },
    footer:{
        marginTop:40
    },
    loginButton:{
        position:'absolute',
        bottom:-40,
        width:100,
        height:100,
        alignSelf:'center',
        backgroundColor:'#147efb',
        borderWidth:4,
        borderColor:'#FFF',
        borderRadius:50,
        elevation:10,
        zIndex:10,
        justifyContent:'center'
    }
})

export default connect(mapStateToProps,mapDispatchToProps)(Login);