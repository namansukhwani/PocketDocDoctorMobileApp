import React, { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, StatusBar, FlatList, TouchableOpacity, ToastAndroid } from 'react-native';
import { Paragraph, Avatar, Caption, ActivityIndicator, Subheading, TextInput, Button, HelperText } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Rating } from 'react-native-ratings';

function DocReviewsAll(props) {

    //refs

    //state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [reviewType, setreviewType] = useState('All')

    //lifecycle
    useEffect(() => {
        getAllReviews('dateCreated', 'desc')
    }, [])

    //methods
    const getAllReviews = (orderBy, orderType, refresh = false, typeChange = false) => {
        if (refresh) {
            setIsRefreshing(true);
        }
        else if (typeChange) {
            setReviewsLoading(true);
        }
        firestore().collection('doctors').doc(auth().currentUser.uid).collection('reviews').orderBy(orderBy, orderType).get()
            .then(reviews => {
                return Promise.all(reviews.docs.map(async appointment => {
                    return {
                        id: appointment.id,
                        userData: await getUserData(appointment.data().userId),
                        ...appointment.data()
                    }
                }))
                    .then(list => {
                        setReviews(list);
                        if (refresh) {
                            setIsRefreshing(false)
                        }
                        setReviewsLoading(false);
                    })
                    .catch(err => {
                        console.log(err);
                        ToastAndroid.show("Unable to fetch Reviews", ToastAndroid.SHORT);
                    })

            })
            .catch(err => {
                console.log(err);
                ToastAndroid.show("Unable to fetch Reviews", ToastAndroid.SHORT);
            })
    }

    const changeType = (type) => {
        if (type === "All") {
            setreviewType(type)
            getAllReviews('dateCreated', 'desc', false, true);
        }
        else if (type === "Good") {
            setreviewType(type);
            getAllReviews('rating', 'desc', false, true);
        }
        else {
            setreviewType(type);
            getAllReviews('rating', 'asc', false, true);
        }
    }

    const getUserData = (uid) => {
        return firestore().collection('users').doc(uid).get()
            .then(data => {
                return data.data();
            })
            .catch(err => {
                console.log(err);
            })
    }

    function Review({ data, index, totalLength }) {

        return (
            <View style={[styles.review, index === totalLength - 1 || index === 5 ? { borderBottomWidth: 0 } : { borderBottomWidth: 0.4 }]} key={index.toString()}>
                <View style={styles.reviewSendersName}>
                    {data.userData.profilePictureUrl === '' ?
                        <Avatar.Image size={20} source={require('../assets/user_avatar.png')} />
                        :
                        <Avatar.Image size={20} source={{ uri: data.userData.profilePictureUrl }} />
                    }
                    <Caption style={{ marginLeft: 4 }}>{data.userData.name}</Caption>
                </View>
                <Paragraph numberOfLines={7}>{data.comment}</Paragraph>
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
                    <Rating
                        type="custom"
                        readonly={true}
                        imageSize={14}
                        startingValue={data.rating}
                        tintColor="#fff"
                        ratingBackgroundColor="#eeeeee"
                    />
                    <Caption style={{ fontSize: 12 }}>{moment(data.dateCreated.toDate()).format('DD/MM/YYYY')}</Caption>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar backgroundColor="#ffffff" barStyle='dark-content' />
            <View style={styles.reviewTypes}>
                <TouchableOpacity onPress={() => changeType("All")} style={reviewType == 'All' ? styles.reviewTypeSelected : styles.reviewTypeUnselected}><Paragraph style={{ marginVertical: 0, fontWeight: 'bold', color: reviewType == "All" ? "#FFF" : "#147EFB" }}>All</Paragraph></TouchableOpacity>
                <TouchableOpacity onPress={() => changeType("Good")} style={reviewType == 'Good' ? styles.reviewTypeSelected : styles.reviewTypeUnselected}><Paragraph style={{ marginVertical: 0, fontWeight: 'bold', color: reviewType == "Good" ? "#FFF" : "#147EFB" }}>Good First</Paragraph></TouchableOpacity>
                <TouchableOpacity onPress={() => changeType("Bad")} style={reviewType == 'Bad' ? styles.reviewTypeSelected : styles.reviewTypeUnselected}><Paragraph style={{ marginVertical: 0, fontWeight: 'bold', color: reviewType == "Bad" ? "#FFF" : "#147EFB" }}>Bad First</Paragraph></TouchableOpacity>
            </View>
            {reviewsLoading ?
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <ActivityIndicator animating={true} style={{ alignSelf: 'center' }} color="#147efb" size={60} />
                </View>
                :
                <FlatList
                    data={reviews}
                    refreshing={isRefreshing}
                    onRefresh={() => { getAllReviews('dateCreated', 'desc', true); setreviewType('All') }}
                    renderItem={({ item, index }) => <Review data={item} index={index} key={index.toString()} />}
                    keyExtractor={(item, index) => index.toString()}
                    // showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 10, paddingBottom: 55 }}
                />
            }

        </View>
    )
}

export default DocReviewsAll;

const styles = StyleSheet.create({
    review: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderColor: "#eeeeee"
    },
    reviewSendersName: {
        paddingHorizontal: 7,
        paddingVertical: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#e3f2fd",
        alignSelf: 'flex-start',
        borderRadius: 15
    },
    reviewTypes: {
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 7,
        backgroundColor: '#eeeeee',
        borderRadius: 25,
        marginHorizontal: 10,
        justifyContent: 'flex-start',
        alignItems: 'center',
        // borderBottomColor:'#147efb',
        // borderBottomWidth:1
    },
    reviewTypeSelected: {
        backgroundColor: '#147efb',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 4,
        color: '#fff',
        elevation: 2,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    reviewTypeUnselected: {
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingVertical: 2,
        color: '#fff',
        borderColor: '#147efb',
        borderWidth: 2,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        backgroundColor: '#fff',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        padding: 15
    },
    button: {
        position: 'absolute',
        bottom: 10,
        left: 12,
        right: 12,
        justifyContent: 'center',
        borderRadius: 15
    },
})