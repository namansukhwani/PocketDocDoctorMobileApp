import React from 'react';
import NetInfo from "@react-native-community/netinfo";
import {Alert} from "react-native";

export class Utility extends React.Component{

    checkNetwork(){
        return new Promise((resolve,reject)=>{
            NetInfo.fetch()
            .then(state=>{
                if(state.isConnected == true){
                    resolve('OK');
                }
                else{
                    Alert.alert(
                        'No Internet Connection',
                        'Your internet connection is OFF, Please turn ON.',
                        [
                            {text: 'Ok', },
                        ],
                        {cancelable: false},
                    );
                    reject('No Internet Connection');
                }
            })
        })
    }
}