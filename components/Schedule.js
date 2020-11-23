import React from 'react';
import {View,Text,StyleSheet,StatusBar} from 'react-native';
import {} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {connect} from 'react-redux';
import {Utility} from '../utility/utility';
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
function Schedule(props){
    
    //states

    //methods
    
    return(
        <View style={{}}>
            <StatusBar backgroundColor='#fff' barStyle='dark-content' />
        </View>
    )
}

const styles=StyleSheet.create({

});

export default connect(mapStateToProps,mapDispatchToProps)(Schedule);