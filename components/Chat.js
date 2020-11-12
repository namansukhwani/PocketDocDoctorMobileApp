import React,{useState,useEffect,useCallback} from 'react';
import {View,Text,StatusBar, BackHandler, ToastAndroid,StyleSheet,TouchableOpacity} from 'react-native';
import {IconButton} from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import {connect} from 'react-redux';
import {Utility} from '../utility/utility';
import {ChatHeader} from '../utility/ViewUtility';
import {GiftedChat,Send} from 'react-native-gifted-chat';
import {} from '../redux/ActionCreators';

//redux
const mapStateToProps=state =>{
    return{
        doctor:state.doctor
    };
};

const mapDispatchToProps=(dispatch) => ({

})


//component
function Chat(props){

    //values
    const [messages, setMessages] = useState([]);
    
    //lifecycles
    useEffect(() => {
        setMessages([
            {
              _id: 1,
              text: 'Hello developer',
              createdAt: new Date(),
              user: {
                _id: 2,
                name: 'React Native',
                avatar: 'https://placeimg.com/140/140/any',
              },
            },
          ])
        
    }, [])

    //methods
    const onSend=useCallback((message=[])=>{
        setMessages(messages=>GiftedChat.append(messages,message))    
    },[])

    function SendButton(props){
        return(
            <Send {...props}>
                <MaterialIcon name="send-circle" size={45} color="#147efb"/>
            </Send>
        )
    }

    function Attachments(){
        return(
            <MaterialIcon style={{marginLeft:5,alignSelf:'center'}} onPress={()=>console.log("attach")} name="attachment" size={40} color="#147efb"/>
        )
    }

    return(
        <View style={{flex:1,backgroundColor:'#fff'}}>
            <StatusBar backgroundColor="#fff" barStyle='dark-content' />
            <ChatHeader backAction={()=>{props.navigation.goBack()}} videoCall={()=>{}} title={props.route.params.name} profilePicUrl={props.route.params.profilePicUrl} />
            <View style={{flex:1}}>
                <GiftedChat
                    messages={messages}
                    user={{
                        _id:1,
                        name:'Naman Sukhwani'
                    }}
                    onSend={message=>onSend(message)}
                    loadEarlier={true}
                    renderAvatarOnTop={true}
                    scrollToBottom={true}
                    renderSend={(props)=>SendButton(props)}
                    renderActions={()=>Attachments()}
                />
            </View>
        </View>
    )
}

export default connect(mapStateToProps,mapDispatchToProps)(Chat);