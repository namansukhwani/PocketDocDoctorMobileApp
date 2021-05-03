import * as ActionTypes from './ActionTypes';

export const appointments=(
    state=[],
    action
)=>{
    switch(action.type)
    {
        case ActionTypes.ADD_APPOINTMENTS:
            return action.payload;
        default:
            return state;
    }
}