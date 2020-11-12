import * as ActionTypes from './ActionTypes';

const URL="https://pdoc-api.herokuapp.com/";

//User Functions
export const getDoctorDetails=(uid)=>dispatch=>{
    dispatch(doctorLoading());

    return new Promise((resolve,reject)=>{

        fetch(URL+`/doctors/${uid}`,{
            method:"GET",
            headers:new Headers({
                'Origin':'https://PocketDocOnly.com',
                'Content-Type':'application/json'
            }),
        })
        .then(res=>res.json())
        .then(response=>{
            if(!response.status){
                dispatch(doctorError(response.message));
                reject({err:response.message,status:true});
            }
            else{
               dispatch(doctorAdd(response.data));
               resolve();
            }
        })
        .catch(err=>{
            console.log(err);
            dispatch(doctorError(err));
            reject({err:err,status:false});
        })
    })
}

export const addDoctorDetails=(uid,userData)=>dispatch=>{
    dispatch(doctorLoading());
    console.log("redux userLoading");

    return new Promise((resolve,reject)=>{
        fetch(URL+`/doctors/${uid}`,{
            method:"POST",
            headers:new Headers({
                'Origin':'https://PocketDocOnly.com',
                'Content-Type':'application/json'
            }),
            body:userData
        })
        .then(res=>res.json())
        .then(response=>{
            if(!response.status){
                console.log("redux userError");
                dispatch(doctorError(response.message));
                reject(response.message);
            }
            else{
                console.log("redux userAdd");
                dispatch(doctorAdd(response.data));
                resolve();
            }
        })
        .catch(err=>{
            console.log(err);
            dispatch(doctorError(err));
            reject(err);
        })
    })
}

export const updateDoctorDetails=(uid,updateData)=>dispatch=>{
    dispatch(doctorLoading());
    console.log("redux userLoading");
    
    return new Promise((resolve,reject)=>{
        fetch(URL+`/doctors/${uid}`,{
            method:"PUT",
            headers:new Headers({
                'Origin':'https://PocketDocOnly.com',
                'Content-Type':'application/json'
            }),
            body:updateData
        })
        .then(res=>res.json())
        .then(response=>{
            if(!response.status){
                console.log("redux userError");
                dispatch(doctorError(response.message));
                reject(response.message);
            }
            else{
                console.log("redux userUpdated");
                dispatch(doctorAdd(response.data));
                resolve();
            }
        })
        .catch(err=>{
            console.log(err);
            dispatch(doctorError(err));
            reject(err);
        })
    })
}

const doctorLoading=()=>({
    type:ActionTypes.LOADING_DOCTOR
})

const doctorAdd=(doctorData)=>({
    type:ActionTypes.ADD_DOCTOR,
    payload:doctorData
})

const doctorError=(err)=>({
    type:ActionTypes.ERROR_DOCTOR,
    payload:err
})

//Chats