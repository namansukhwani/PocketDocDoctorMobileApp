import React,{useState,useEffect,useCallback} from 'react';
import {View,Text,StatusBar, BackHandler, ToastAndroid,StyleSheet,TouchableOpacity} from 'react-native';
import {Avatar, Button, Headline, Paragraph, RadioButton, Subheading,TextInput, Title,Searchbar, Badge} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {useBackHandler} from '@react-native-community/hooks';
import {useFocusEffect} from '@react-navigation/native';
import {connect} from 'react-redux';
import {Utility} from '../utility/utility';
import {} from '../redux/ActionCreators';
import { FlatList } from 'react-native-gesture-handler';
import moment from 'moment';
import * as Animatable from 'react-native-animatable';
import firestore from '@react-native-firebase/firestore';
import ComunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Spinner from 'react-native-spinkit';
import { EventRegister } from 'react-native-event-listeners';

const todayDate=new Date();

const mapStateToProps=state =>{
    return{
        doctor:state.doctor
    };
};

const mapDispatchToProps=(dispatch) => ({

})


function AllChats(props){

    const [search, setSearch] = useState('');
    // const [unread, setUnread] = useState(0);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

     //lifecycle

    useFocusEffect(
        useCallback(()=>{
        StatusBar.setBackgroundColor('#fff');
    },[]))

     useEffect(()=>{
        setFilteredData(
            data.filter(doc=>{
                return doc.userName.toLowerCase().includes(search.toLowerCase())
            })    
        )
     },[search,data])

     useEffect(()=>{
        
        
        const logout=EventRegister.addEventListener('logout',()=>{
            unsubscribe();
        })

        const unsubscribe=firestore().collection("chatRooms")
        .where('doctorId','==',auth().currentUser.uid)
        .orderBy('lastUpdatedDate','desc')
        .onSnapshot(querySnapshot=>{
            //setDatan([...querySnapshot.docs.]);
            //console.log(querySnapshot.docs[0]._ref._documentPath);
            const threads=querySnapshot.docs.map(documentSnapshot=>{
                //console.log("Chat Rooms",documentSnapshot.data());
                //setDatan(datan.concat(documentSnapshot.data()))
                return(documentSnapshot.data());
            })
            setData(threads);
            if(loading){setLoading(false)}
            //console.log("Changes happened");
        }) 

        return ()=>{
            unsubscribe();
            EventRegister.removeEventListener(logout);
        }
    },[]);

    //methods
    function ListView({item,index}){

        const unread=item.userMessageCount;
        const lable=item.userName.split(' ')[0][0]+item.userName.split(' ')[1][0]
        var time;
        var updateDate=new Date(item.lastUpdatedDate.toDate());
        const yesterday=new Date(Date.now()-86400000);
        if(todayDate.getDate()===updateDate.getDate()){
            var time=moment(updateDate).format("hh:mm a");
        }
        else if(yesterday.getDate()===updateDate.getDate()){
            var time="Yesterday";
        }
        else if(todayDate.getFullYear()===updateDate.getFullYear()){
            var time=moment(updateDate).format("Do MMM");
        }
        else{
            var time=moment(updateDate).format("DD/MM/YYYY");
        }
        //const color=('rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')');
        const color=index%2===0 ? "#00b8d4":"#3f51b5";

        const handelPress=()=>{
            firestore()
            .collection("chatRooms")
            .doc(item.roomId)
            .update({
                userMessageCount:0
            })
            .then((data)=>{
                console.log("done room update");
                props.navigation.navigate('Chat',{data:item});  
            })
            .catch(err=>{console.log(err);})
        }

        return(
            <Animatable.View animation="slideInUp" duration={500} useNativeDriver={true}>
            <TouchableOpacity style={styles.listItem} onPress={()=>handelPress()}>
                {item.userProfilePicUrl===''?
                    <Avatar.Text style={{alignSelf:'center'}} theme={{colors:{primary:color}}} size={49} label={lable} />
                    :
                    <Avatar.Image source={{uri:item.userProfilePicUrl}} style={{alignSelf:'center'}} theme={{colors:{primary:'#147efb'}}} size={49} />
                }
                <View style={{marginLeft:10,flex:1}}>
                    <Title>{item.userName}</Title>
                    <Paragraph numberOfLines={1} style={{overflow:'hidden'}}>{item.lastMessage===''? "No messages yet.":item.lastMessage}</Paragraph>
                    <Text style={styles.time}>{time}</Text>
                </View>
                <Badge 
                    visible={unread!==0} 
                    style={{
                        position:'absolute',
                        top:40,
                        right:20,
                        backgroundColor:'#147efb'
                    }}
                    theme={{colors:{primary:'#147efb'}}}

                >
                    {unread}
                </Badge>
            </TouchableOpacity>
            </Animatable.View>
        );
    }
    

    function headerComponent(){
        return(
            <View >
            <Headline style={{fontSize:32,fontWeight:"bold",marginTop:10}}>Recents</Headline>
            <Paragraph>All your recents online appointment chats and calls are listed below.</Paragraph>
            </View>
        )
    }

    return(
        <View style={{flex:1,backgroundColor:"#fff",}}>
            <StatusBar backgroundColor="#fff" barStyle='dark-content' />
            <View style={{paddingHorizontal:15,}}>
            <Searchbar
                placeholder="Search"
                value={search}
                onChangeText={(value)=>setSearch(value)}
                theme={{colors:{primary:"#147efb"}}}
                style={{
                    marginTop:15
                }}
            />
            </View>
            
            {loading?
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Spinner 
                        type="Wave"
                        color="#147efb"
                        isVisible={loading}
                        size={50}
                    />
                </View>
                :
                (filteredData.length===0 ? 
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <ComunityIcon name='message-bulleted-off' size={80} color="#147efb"/>
                        <Subheading style={{}}>No Chats Available.</Subheading>
                    </View>
                    :
                    <FlatList
                        data={filteredData}
                        renderItem={ListView}
                        keyExtractor={(item,index)=>index.toString()}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={headerComponent}
                        contentContainerStyle={{padding:15}}
                    />
                )
            }
            
            

        </View>
    );

}

const styles=StyleSheet.create({
    listItem:{
        flexDirection:'row',
        padding:5,
        height:78,
        // borderTopColor:"#b6b6b6",
        // borderTopWidth:0.4,
        borderBottomWidth:0.4,
        borderBottomColor:'#b6b6b6',
    },
    time:{
        position:'absolute',
        top:5,
        right:0,
        color:"#147efb"
    }
});

export default connect(mapStateToProps,mapDispatchToProps)(AllChats); 
