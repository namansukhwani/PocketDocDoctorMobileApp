import React from 'react';
import { View, TouchableOpacity,Image } from 'react-native';
import { Appbar, Avatar, Title, Subheading,Caption } from 'react-native-paper';

export const ChatHeader=({backAction,videoCall,title,profilePicUrl})=>{
    const lable=title.split(' ')[0][0]+title.split(' ')[1][0]
    return(
        <Appbar.Header theme={{colors:{primary:'#fff'}}}>
            <Appbar.BackAction onPress={()=>backAction()} />
            <Appbar.Content 
                title={
                    <View style={{flexDirection:'row'}}>
                        {profilePicUrl===''?
                            <Avatar.Text style={{alignSelf:'center'}} theme={{colors:{primary:'#6a1b9a'}}} size={34} label={lable} />
                            :
                            <Avatar.Image source={{uri:profilePicUrl}} style={{alignSelf:'center'}} theme={{colors:{primary:'#147efb'}}} size={34} />
                        }
                        <Title style={{marginLeft:10}}>{title}</Title>
                    </View>
                } 
                titleStyle={{alignSelf:"center"}}
            />
            <Appbar.Action icon="video-account" size={35} color="#147efb" onPress={()=>videoCall} />
        </Appbar.Header>
    )
}

export const HeaderTitle=({title})=>{
    return(
        <Appbar.Header style={{ justifyContent: 'center',elevation:0,height:45}} theme={{ colors: { primary: '#fff' } }}>
            <Appbar.Content title={title} titleStyle={{alignSelf:"center"}}/> 
        </Appbar.Header>
    )
}

export const HomeHeader = ({ profilePic, name, onPress ,phoneNo}) => {
    return (
        <Appbar.Header style={{ justifyContent: 'space-between', paddingHorizontal: 10 }} theme={{ colors: { primary: '#fff' } }}>
            <Image source={require('../assets/PocketDoctorIcon.png')} style={{width:35,height:35,resizeMode:"contain"}} />
            <TouchableOpacity style={{ flexDirection: "row", }} onPress={() => onPress()} >
                <View style={{alignSelf:"center"}}>
                    <Subheading style={{ fontSize: 18,marginVertical:0, fontWeight: 'bold', alignSelf: 'center' }}>{name}</Subheading>
                    <Caption style={{alignSelf:"flex-end",marginVertical:0}}>{"+91 "+phoneNo}</Caption>
                </View>
                {profilePic === '' ?
                    <Avatar.Image style={{ elevation: 2, alignSelf: 'center', marginLeft: 10 }} size={35} source={require('../assets/user_avatar.png')} />
                    :
                    <Avatar.Image style={{ elevation: 2, alignSelf: 'center', marginLeft: 10 }} size={35} source={{ uri: profilePic }} />
                }
            </TouchableOpacity>
        </Appbar.Header>
    )
}