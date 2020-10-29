import React,{useEffect} from 'react';
import {} from 'react-native';
import Main from './components/main_routing';
import SplashScreen from 'react-native-splash-screen';

export default class App extends React.Component{

  componentDidMount(){
    SplashScreen.hide();
  }

  render(){
    return (
      <Main/>
    );
  }
};

