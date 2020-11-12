import React,{useState,useEffect} from 'react';
import {View,Text,StatusBar, BackHandler, ToastAndroid,StyleSheet,TouchableOpacity} from 'react-native';
import {Avatar, Button, Headline, Paragraph, RadioButton, Subheading,TextInput, Title,Searchbar, Badge} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {useBackHandler} from '@react-native-community/hooks';
import {connect} from 'react-redux';
import {Utility} from '../utility/utility';
import {} from '../redux/ActionCreators';
import { FlatList } from 'react-native-gesture-handler';
import moment from 'moment';
import * as Animatable from 'react-native-animatable';

const data=[
    {
        name:"Nitesh Sukhwani",
        lastMess:"Cool!",
        time:new Date('11/07/2020'),
        profilePic:""
    },
    {
        name:"Joy Singh",
        lastMess:"Sure Done:)",
        time:new Date('11/02/2020'),
        profilePic:"https://dyl80ryjxr1ke.cloudfront.net/external_assets/hero_examples/hair_beach_v1785392215/original.jpeg"
    },
    {
        name:"Suresh Sukhwani",
        lastMess:"Everythig is fine whatsup with you",
        time:new Date(),
        profilePic:""
    },
    {
        name:"Manas Satpute",
        lastMess:"Ok bro GREAT!!!",
        time:new Date('11/10/2020'),
        profilePic:""
    },
    {
        name:"Nitesh Sukhwani",
        lastMess:"Cool!",
        time:new Date('11/07/2018'),
        profilePic:""
    },
    {
        name:"Joy Singh",
        lastMess:"Sure Done:)",
        time:new Date('11/02/2020'),
        profilePic:"https://dyl80ryjxr1ke.cloudfront.net/external_assets/hero_examples/hair_beach_v1785392215/original.jpeg"
    },
    {
        name:"Suresh Sukhwani",
        lastMess:"Everythig is fine whatsup with you",
        time:new Date(),
        profilePic:""
    },
    {
        name:"Manas Satpute",
        lastMess:"Ok bro GREAT!!!",
        time:new Date('11/10/2019'),
        profilePic:""
    },
  
]

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
    const [unread, setUnread] = useState(0);

    function ListView({item,index}){

        const lable=item.name.split(' ')[0][0]+item.name.split(' ')[1][0]
        var time;
        const yesterday=new Date(Date.now()-86400000);
        if(todayDate.getDate()===item.time.getDate()){
            var time=moment(item.time).format("h:m a");
        }
        else if(yesterday.getDate()===item.time.getDate()){
            var time="Yesterday";
        }
        else if(todayDate.getFullYear()===item.time.getFullYear()){
            var time=moment(item.time).format("Do MMM");
        }
        else{
            var time=moment(item.time).format("DD/MM/YYYY ");
        }
    
        return(
            <Animatable.View animation="slideInUp" duration={500} useNativeDriver={true}>
            <TouchableOpacity style={styles.listItem} onPress={()=>props.navigation.navigate('Chat',{name:item.name,profilePicUrl:item.profilePic})}>
                {item.profilePic===''?
                    <Avatar.Text style={{alignSelf:'center'}} theme={{colors:{primary:('rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')')}}} size={49} label={lable} />
                    :
                    <Avatar.Image source={{uri:item.profilePic}} style={{alignSelf:'center'}} theme={{colors:{primary:'#147efb'}}} size={49} />
                }
                <View style={{marginLeft:10,flex:1}}>
                    <Title>{item.name}</Title>
                    <Paragraph numberOfLines={1} style={{overflow:'hidden'}}>{item.lastMess}</Paragraph>
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
            
            <FlatList
                data={data}
                renderItem={ListView}
                keyExtractor={(item,index)=>index.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={headerComponent}
                contentContainerStyle={{padding:15}}
            />

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
