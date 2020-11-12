import React from 'react';
import {StatusBar, View} from 'react-native';
import Spinner from 'react-native-spinkit';

export default function LoadingScreen({backgroundColor,color}){
    return(
        <View style={{flex:1,backgroundColor:backgroundColor,justifyContent:'center'}}>
            <StatusBar backgroundColor={backgroundColor} barStyle="dark-content" />
            <Spinner 
                type="Wave"
                color={color}
                style={{alignSelf:"center"}}
                isVisible={true}
                size={70}
            />
        </View>
    )
}