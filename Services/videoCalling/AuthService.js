import ConnectyCube from 'react-native-connectycube';
import { ConnectyCubeConfig } from '../../config';

class Auth {


    init = () => {
        const CONFIG = {
            on: {
                sessionExpired: (handleResponse, retry) => {
                    ConnectyCube.createSession()
                        .then(() => {
                            retry();
                            this.reLogin();
                        })
                        .catch((error) => { });
                },
            },
            // debug: { mode: 1 }
        }

        ConnectyCube.init(ConnectyCubeConfig, CONFIG);
        ConnectyCube.createSession()
            .then(() => {
                // retry();
                //this.reLogin();
            })
            .catch((error) => { console.log(error); });
    }

    reLogin = () => {
        console.log("relogin Connecty Cloud WORKING");
        if (!!ConnectyCube.chat.isConnected || !ConnectyCube.chat._isConnecting) {
            ConnectyCube.createSession({ login: global.userAuthData.uid, password: '123456789' })
                .then((session) => {
                    if (!!ConnectyCube.chat.isConnected || !ConnectyCube.chat._isConnecting) {
                        ConnectyCube.chat.connect({
                            userId: session.user_id,
                            password: "123456789",
                        })
                            .then(() => {
                                console.log("Connected to the chat");
                            })
                            .catch(err => { console.log("Unable to connect to the chat"); reject(err) })
                    }
                    console.log("Relogin AuthService::", session);
                })
                .catch(err => console.log("reLogin AuthService err::", err));
        }
    }

    login = userId => {

        if (!!ConnectyCube.chat.isConnected || !ConnectyCube.chat._isConnecting) {
            console.log("login ConnnectyCloud WORKING");
            return new Promise((resolve, reject) => {
                //console.log(global.userAuthData.uid);
                ConnectyCube.createSession({ login: userId, password: '123456789' })
                    .then((session) => {
                        //console.log("login ::::", session);
                        //console.log("Hello there", ConnectyCube.chat._isConnecting);
                        if (!!ConnectyCube.chat.isConnected || !ConnectyCube.chat._isConnecting) {
                            ConnectyCube.chat.connect({
                                userId: session.user_id,
                                password: "123456789",
                            })
                                .then(() => {
                                    console.log("Connected to the chat");
                                })
                                .catch(err => { console.log("Unable to connect to the chat"); reject(err) })
                        }
                    })
                    .then(resolve)
                    .catch(reject);
            });
        }
    };

    logout = () => {
        ConnectyCube.chat.disconnect();
        ConnectyCube.destroySession();
    };
}

export const AuthService = new Auth();