import * as ActionTypes from './ActionTypes';
import firestore from '@react-native-firebase/firestore';

const URL = "https://pdoc-api.herokuapp.com/";

//User Functions
export const getDoctorDetails = (uid) => dispatch => {
    dispatch(doctorLoading());

    return new Promise((resolve, reject) => {


        firestore().collection('doctors').doc(uid).get()
            .then(doctor => {
                if (doctor.exists) {
                    dispatch(doctorAdd(doctor.data()));
                    resolve();
                }
                else {
                    dispatch(doctorError("doctor does not exists"));
                    reject({ err: "doctor does not exists", status: true });
                }
            })
            .catch(err => {
                console.log(err);
                dispatch(doctorError(err));
                reject({ err: err, status: false });
            })
    })
}

export const addDoctorDetails = (uid, userData) => dispatch => {
    dispatch(doctorLoading());
    console.log("redux userLoading");

    return new Promise((resolve, reject) => {

        firestore().collection('doctors').doc(uid).set(userData)
            .then(() => {
                firestore().collection('doctors').doc(uid).get()
                    .then(doctor => {
                        if (doctor.exists) {
                            console.log("redux userAdd");
                            dispatch(doctorAdd(doctor.data()));
                            resolve();
                        }
                        else {
                            dispatch(doctorError("doctor does not exists"));
                            reject({ err: "doctor does not exists", status: true });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        dispatch(doctorError(err))
                        reject(err)
                    })
            })
            .catch(err => {
                console.log(err);
                dispatch(doctorError(err));
                reject(err);
            })


    })
}

export const updateDoctorDetails = (uid, updateData) => dispatch => {
    dispatch(doctorLoading());
    console.log("redux userLoading");

    return new Promise((resolve, reject) => {

        firestore().collection('doctors').doc(uid).update(updateData)
            .then(() => {
                firestore().collection('doctors').doc(uid).get()
                    .then(doctor => {
                        if (doctor.exists) {
                            console.log("redux userUpdated");
                            dispatch(doctorAdd(doctor.data()));
                            resolve();
                        }
                        else {
                            dispatch(doctorError("doctor does not exists"));
                            reject({ err: "doctor does not exists", status: true });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        dispatch(doctorError(err))
                        reject(err)
                    })
            })
            .catch(err => {
                console.log(err);
                dispatch(doctorError(err));
                reject(err);
            })
    })
}

const doctorLoading = () => ({
    type: ActionTypes.LOADING_DOCTOR
})

const doctorAdd = (doctorData) => ({
    type: ActionTypes.ADD_DOCTOR,
    payload: doctorData
})

const doctorError = (err) => ({
    type: ActionTypes.ERROR_DOCTOR,
    payload: err
})

export const addAppointments = (appoinmentsList) => ({
    type: ActionTypes.ADD_APPOINTMENTS,
    payload: appoinmentsList
})

//Chats