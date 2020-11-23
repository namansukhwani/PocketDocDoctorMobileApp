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
function AppointmentsPrevious(props){
    
    //states

    //methods
    
    return(
        <View style={{flex:1,backgroundColor:'#fff'}}>
            <StatusBar backgroundColor='#fff' barStyle='dark-content' />
            <Text>Appointments Previous</Text>
        </View>
    )
}

const styles=StyleSheet.create({

});

export default connect(mapStateToProps,mapDispatchToProps)(AppointmentsPrevious);