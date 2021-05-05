import React,{useCallback, useState} from 'react';
import {View,StyleSheet,StatusBar,Image,ToastAndroid, Alert,Linking,BackHandler} from 'react-native';
import {Avatar, Button, Headline, Paragraph, RadioButton, Subheading,TextInput, Title,} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import auth from '@react-native-firebase/auth';
import Spinner from 'react-native-spinkit';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import {connect} from 'react-redux';
import {Utility} from '../utility/utility';
import {updateDoctorDetails} from '../redux/ActionCreators';
import {useFocusEffect} from '@react-navigation/native';

//redux
const mapStateToProps=state =>{
    return{
        doctor:state.doctor
    };
};

const mapDispatchToProps=(dispatch) => ({
    updateDoctorDetails:(uid,updateData)=>dispatch(updateDoctorDetails(uid,updateData)),
})

function SetProfilePic(props){
    
    const [disable, setDisable] = useState(false);
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [backCount, setBackCount] = useState(0);

    //lifecycle

    useFocusEffect(
        useCallback(() => {
            const backhandler=BackHandler.addEventListener("hardwareBackPress",()=>{
                backCount===0 ? ToastAndroid.show('Press back to exit',ToastAndroid.SHORT) : BackHandler.exitApp();
                setBackCount(1);
                setTimeout(()=>{setBackCount(0)},3000)
                return true;
            })

            return ()=>{
                backhandler.remove();
            }
        },[])
    );

    async function uploadImage(path,filename){
        setDisable(true);
        const utility=new Utility();
        utility.checkNetwork()
        .then(()=>{
            setUploading(true);
            const task =storage().ref().child('images/'+filename).putFile(path);

            task.on('state_changed',snapshot=>{
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },(error)=>{
                setDisable(false)
                console.log(error);
                switch (error.code) {
                    case 'storage/unauthorized':
                      // User doesn't have permission to access the object
                      break;
      
                    case 'storage/canceled':
                      // User canceled the upload
                      break;
      
                    case 'storage/unknown':
                      // Unknown error occurred, inspect error.serverResponse
                    break;
                  }
            },()=>{
                task.snapshot.ref.getDownloadURL()
                .then(url=>{
                    setProfilePicUrl(url);
                    
                    const updateData={
                        profilePictureUrl:url
                    }; 

                    props.updateDoctorDetails(auth().currentUser.uid,updateData)
                    .then(()=>{
                        console.log("User data updated.");
                        setUploading(false);
                    })
                    .catch(err=>{
                        console.log(err);
                        setUploading(false);
                        Alert.alert("Unable to update user.")
                        
                    })
                    
                    setDisable(false);
                })
                .catch(err=>{
                    console.log("url ::",err);
                    setUploading(false);
                    setDisable(false);
                })
                
            })

        })
        .catch(err=>{console.log(err);setDisable(false)});
    }

    function pickFromGallery(){
        ImagePicker.openPicker({
            width:400,
            height:400,
            compressImageQuality:0.8,
            cropping:true,
            enableRotationGesture:true,
            mediaType:'photo'
        })
        .then(image=>{
            let filename = image.path.substring(image.path.lastIndexOf('/') + 1, image.path.length);
            uploadImage(image.path.slice(7),filename);
            console.log("path:: ",image.path.slice(7));
        })
        .catch(err=>{
            console.log(err);
            if(err.message=='Required permission missing'){
                Alert.alert(
                    'Permission Denied',
                    'Please allow permission to use storage.',
                    [
                        
                        {text:'GO TO SETTINGS', style:'default', onPress:()=>{Linking.openSettings()}},
                        {text: 'Ok', }
                    ],
                    {cancelable: false},
                );
                return;
            }
            else if(err.message=='User cancelled image selection'){
                return;
            }
            else{
                Alert.alert("Some error occurred while fetching the image.");
            }
            
        })
    }

    function captureImage(){
        ImagePicker.openCamera({
            width:400,
            height:400,
            compressImageQuality:0.8,
            cropping:true,
            enableRotationGesture:true,
            mediaType:'photo'
        })
        .then(image=>{
            let filename = image.path.substring(image.path.lastIndexOf('/') + 1, image.path.length);
            uploadImage(image.path,filename);
            console.log("path:: ",image.path);
        })
        .catch(err=>{
            console.log(err);
            if(err.message=='Required permission missing'){
                Alert.alert(
                    'Permission Denied',
                    'Please allow permission to use camera.',
                    [
                        
                        {text:'GO TO SETTINGS', style:'default', onPress:()=>{Linking.openSettings()}},
                        {text: 'Ok', }
                    ],
                    {cancelable: false},
                );
                return;
            }
            else if(err.message=='User cancelled image selection'){
                return;
            }
            else{
                Alert.alert("Some error occurred while fetching the image.");
            }
            
        })
    }

    return(
        <View style={{flex:1,backgroundColor:"#fff"}}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Animatable.View style={styles.container} animation="slideInUp" duration={700} useNativeDriver={true}>
                {uploading ? 
                    <View style={{alignSelf:'center',marginBottom:40}}>
                        <Spinner 
                            type="Wave"
                            color="#147efb98"
                            style={{alignSelf:"center"}}
                            isVisible={uploading}
                            size={50}
                        />
                        <Title style={{color:"#147efb",alignSelf:"center"}}>UPLOADING</Title>
                    </View>
                    :
                    (profilePicUrl===""? 
                        <Avatar.Image style={{elevation:10,alignSelf:'center',marginBottom:40}} size={130} source={require('../assets/user_avatar.png')} /> 
                        :
                        <Avatar.Image style={{elevation:10,alignSelf:'center',marginBottom:40}} size={130} source={{uri:profilePicUrl}} />
                    )
                    
                }
                
                <Title style={{fontWeight:'bold',alignSelf:'center'}}>Setup Your Profile Picture</Title>
                <Paragraph style={{alignSelf:'center',width:'85%',textAlign:'center'}}>To setup a profile picture choose an image from gallery or capture a new image. You can also skip and setup it later.</Paragraph>
                <Button mode="outlined" style={{width:'90%',alignSelf:'center',marginTop:30}} color="#147EFB" onPress={()=>pickFromGallery()}>Select image from gallery</Button>
                <Button mode="outlined" style={{width:'90%',alignSelf:'center',marginTop:30}} color="#147EFB" onPress={()=>captureImage()}>Click new image</Button>
            </Animatable.View>
            <Button mode="contained" disabled={disable} style={styles.lowerButton} color="#147EFB" onPress={()=>props.navigation.navigate("home")} >{profilePicUrl===""? 'SKIP' :'NEXT'}</Button>
        </View>
    );
}

const styles=StyleSheet.create({
    lowerButton:{
        position:'absolute',
        bottom:20,
        right:20,
        width:80
    },
    container:{
        flex:1,
        backgroundColor:'#fff',
        justifyContent:'center',
        paddingHorizontal:20
    },
})

export default connect(mapStateToProps,mapDispatchToProps)(SetProfilePic);