import * as ActionTypes from './ActionTypes';

export const doctor=(
    state={
        isLoading:false,
        errMess:null,
        doctor:{},
        available:false
    },
    action
)=>{
    switch(action.type)
    {
        case ActionTypes.ADD_DOCTOR:
            return {...state,isLoading:false,errMess:null,available:true,doctor:action.payload};
        case ActionTypes.LOADING_DOCTOR:
            return {...state,isLoading:true};
        case ActionTypes.UPDATE_DOCTOR:
            return;
        case ActionTypes.ERROR_DOCTOR:
            return {...state,isLoading:false,errMess:action.payload};
        case ActionTypes.DELETE_DOCTOR:
            return;
        default:
            return state;
    }
}