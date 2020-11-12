import React from 'react';
import {View} from 'react-native';
import {Appbar, Avatar,Title} from 'react-native-paper';

export const ChatHeader=({backAction,videoCall,title,profilePicUrl})=>{
    const lable=title.split(' ')[0][0]+title.split(' ')[1][0]
    return(
        <Appbar.Header theme={{colors:{primary:'#fff'}}}>
            <Appbar.BackAction onPress={()=>backAction()} />
            <Appbar.Content 
                title={
                    <View style={{flexDirection:'row'}}>
                        {profilePicUrl===''?
                            <Avatar.Text style={{alignSelf:'center'}} theme={{colors:{primary:('rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')')}}} size={34} label={lable} />
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