import {applyMiddleware,createStore} from 'redux';
import AsyncStorage from '@react-native-community/async-storage';
import thunk from 'redux-thunk';
import {persistCombineReducers,persistStore} from 'redux-persist';
import {doctor} from './Doctor';

export const ConfigureStore=()=>{
    const config={
        key:true,
        storage:AsyncStorage,
        debug:true
    };

    const store=createStore(
        persistCombineReducers(config,{
            doctor,
        }),
        applyMiddleware(thunk)
    );

    const persistor=persistStore(store);
    return {persistor,store};
}