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
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';

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

    useFocusEffect(
        useCallback(() => {
            const backhandler=BackHandler.addEventListener("hardwareBackPress",()=>{
                backAction();
                return true;
            })

            return ()=>{
                backhandler.remove();
            }
        },[])
    );

    useEffect(() => {
        const unsubscribe=firestore().collection("chatRooms").doc(props.route.params.data.roomId).collection("messages")
        .orderBy('createdDate','desc')
        .onSnapshot(querySnapshot=>{
            const threads=querySnapshot.docChanges().map(documentSnapshot=>{
                const message=documentSnapshot.doc.data()
                return{
                    _id:documentSnapshot.doc.id,
                    text:message.body,
                    createdAt:message.createdDate.toDate(),
                    user:message.senderId===props.doctor.doctor.doctorId ? 
                        {
                            _id:message.senderId,
                            name:props.doctor.doctor.name,
                            avatar:props.doctor.doctor.profilePictureUrl
                        }
                        :
                        {
                            _id:message.senderId,
                            name:props.route.params.data.userName,
                            avatar:props.route.params.data.userProfilePicUrl
                        },
                    sent:true,
                    received:message.status
                    
                }
            })
            setMessages(messages=>GiftedChat.append(messages,threads)) 
            //setMessages(threads);
            console.log(threads);
        })

            return ()=>unsubscribe();
    }, [])

    //methods
    const onSend=useCallback((message=[])=>{
        const messageDic=message[0];

        //setMessages(messages=>GiftedChat.append(messages,message)) 
        firestore()
        .collection("chatRooms")
        .doc(props.route.params.data.roomId)
        .collection("messages")
        .add({
            body:messageDic.text,
            createdDate:firestore.Timestamp.fromDate(messageDic.createdAt),
            mediaUrl:'',
            senderId:props.doctor.doctor.doctorId,
            status:false,
            type:'text'
        })
        .then(res=>{
            console.log("message sent",res)
            
            firestore()
            .collection("chatRooms")
            .doc(props.route.params.data.roomId)
            .update({
                lastMessage:messageDic.text,
                lastUpdatedDate:firestore.Timestamp.fromDate(messageDic.createdAt),
                doctorMessageCount:firestore.FieldValue.increment(1)
            })
            .then((data)=>{console.log("done room update");})
            .catch(err=>{console.log(err);})
        })
        .catch(err=>console.log("message sent err"));    
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

    function backAction(){
            firestore()
            .collection("chatRooms")
            .doc(props.route.params.data.roomId)
            .update({
                userMessageCount:0
            })
            .then((data)=>{
                console.log("done room update");
                props.navigation.goBack()
            })
            .catch(err=>{console.log(err);})
    }

    return(
        <View style={{flex:1,backgroundColor:'#fff'}}>
            <StatusBar backgroundColor="#fff" barStyle='dark-content' />
            <ChatHeader backAction={()=>{backAction()}} videoCall={()=>{}} title={props.route.params.data.userName} profilePicUrl={props.route.params.data.userProfilePicUrl} />
            <View style={{flex:1}}>
                <GiftedChat
                    messages={messages}
                    user={{
                        _id:props.doctor.doctor.doctorId,
                        name:props.doctor.doctor.name
                    }}
                    onSend={message=>onSend(message)}
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