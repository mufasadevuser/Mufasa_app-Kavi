import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    DrawerContentScrollView,
    useDrawerStatus,
} from '@react-navigation/drawer';
import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-simple-toast';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {SquareLineDivider} from '../components';
import {deleteUserAccount} from '../controller/auth';
import firebaseSetup from '../firebase/';
import {configs} from '../values/config';
import analytics from "@react-native-firebase/analytics";
import appsFlyer from "react-native-appsflyer";

const MufasaAppInfo = () => {
    return (
        <View style={styles.appInfoContainer}>
            <Image
                style={styles.appInfoLogo}
                source={require('../../assets/images/logo.png')}
            />
            <Text style={styles.appInfoText}>
                Exquisite Experiences, Effortlessly
            </Text>
        </View>
    );
};

const UserAvatar = () => {
    const isDrawerVisible = useDrawerStatus() === 'open';
    const [user, setUser] = useState(null);

    const loadUser = async () => {
        const auth = await AsyncStorage.getItem('@auth');
        const u = JSON.parse(auth);
        setUser(u?.user);
    };

    useEffect(() => {
        loadUser();
    }, [isDrawerVisible]);

    if (!user) return null;

    return (
        <View style={styles.avatarContainer}>
            {user && (
                <>
                    <View style={styles.avatar}>
                        <Image
                            source={{uri: `${configs.PUBLIC_URL}/profiles/${user.photo}.png`}}
                            style={styles.avatarImage}
                        />
                    </View>
                    <Text style={styles.avatarName}>
                        Hi, {user.displayName ? user.displayName.split(' ')[0] : 'there'}
                    </Text>
                </>
            )}
        </View>
    );
};

const ChangeCity = ({navigation}) => {
    const handleCity = async () => {
        navigation.toggleDrawer();
        await AsyncStorage.setItem('@city', '');
        navigation.navigate('Home');
    };
    return (
        <TouchableHighlight
            underlayColor="#00000020"
            onPress={handleCity}
            style={styles.changeCityContainer}>
            <>
                <View style={styles.logoutOut}>
                    <FontAwesome5 name="compass" size={25} color="#FCDA80" solid/>
                </View>
                <Text style={styles.cityName}>Change City</Text>
            </>
        </TouchableHighlight>
    );
};

const logoutFunction = async navigation => {
    const {auth} = firebaseSetup();
    try {
        await auth?.().signOut?.();
        await AsyncStorage.removeItem('@auth');
        await AsyncStorage.removeItem('@firstTime');
        await analytics().setUserId(null)
        await analytics().setUserProperty("crm_id", null)
        appsFlyer.setCustomerUserId(null)
        navigation.toggleDrawer();
        navigation.navigate('Login');
    } catch (e) {
    }
};

const LogOut = ({navigation}) => {
    return (
        <TouchableHighlight
            underlayColor="#00000020"
            onPress={() => logoutFunction(navigation)}
            style={styles.changeCityContainer}>
            <>
                <View style={styles.logoutOut}>
                    <FontAwesome5 name="sign-out-alt" size={25} color="#FCDA80"/>
                </View>
                <Text style={styles.cityName}>Logout</Text>
            </>
        </TouchableHighlight>
    );
};

const DeleteAccount = ({onPress}) => {
    return (
        <TouchableHighlight
            underlayColor="#00000020"
            onPress={() => onPress()}
            style={styles.changeCityContainer}>
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
        </TouchableHighlight>
    );
};

const Reservations = ({navigation}) => {
    const handleBooking = async () => {
        navigation.toggleDrawer();
        navigation.navigate('Bookings');
    };
    return (
        <TouchableHighlight
            underlayColor="#00000020"
            onPress={handleBooking}
            style={styles.changeCityContainer}>
            <>
                <View style={styles.logoutOut}>
                    <FontAwesome5 name="calendar-alt" size={25} color="#FCDA80" solid/>
                </View>
                <Text style={styles.cityName}>Reservations</Text>
            </>
        </TouchableHighlight>
    );
};

const Favourites = ({navigation}) => {
    return (
        <TouchableHighlight
            underlayColor="#00000020"
            onPress={() => navigation.navigate('Favourites')}
            style={styles.changeCityContainer}>
            <>
                <View style={styles.logoutOut}>
                    <FontAwesome5 name="heart" size={25} color="#FCDA80" solid/>
                </View>
                <Text style={styles.cityName}>Favourites</Text>
            </>
        </TouchableHighlight>
    );
};

const About = ({navigation}) => {
    const handleAbout = async () => {
        navigation.toggleDrawer();
        navigation.navigate('About');
    };
    return (
        <TouchableHighlight
            underlayColor="#00000020"
            onPress={handleAbout}
            style={styles.changeCityContainer}>
            <>
                <View style={styles.logoutOut}>
                    <FontAwesome5 name="info-circle" size={25} color="#FCDA80" solid/>
                </View>
                <Text style={styles.cityName}>About</Text>
            </>
        </TouchableHighlight>
    );
};

export function DrawerScreen(props) {
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [deleteTextInput, setDeleteTextInput] = useState('');
    const enableDeleteButton = deleteTextInput === 'Delete';
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deletingUserAccount, setDeletingUserAccount] = useState(false);

    useEffect(() => {
        if (!showDeleteAccountModal) {
            setDeleteTextInput('');
            setShowConfirmModal(false);
        }
    }, [showDeleteAccountModal]);

    return (
        <View style={styles.container}>
            <DrawerContentScrollView
                contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
                {...props}>
                <UserAvatar/>
                <SquareLineDivider/>
                <ChangeCity navigation={props.navigation}/>
                {/* <Menu navigation={props.navigation}/> */}
                <Reservations navigation={props.navigation}/>
                <Favourites navigation={props.navigation}/>
                <SquareLineDivider/>
                <About navigation={props.navigation}/>
                <LogOut navigation={props.navigation}/>
                <DeleteAccount onPress={async () => {
                    await trackEventNormal('Delete_Account_Page')
                    setShowDeleteAccountModal
                }}/>
            </DrawerContentScrollView>
            <MufasaAppInfo/>

            <Modal animationType="fade" visible={showDeleteAccountModal} transparent>
                <SafeAreaView style={styles.modalBg}>
                    <View
                        style={{
                            width: '90%',
                            backgroundColor: '#161A46e9',
                            borderWidth: 1,
                            borderColor: '#FCDA80',
                            borderRadius: 12,
                            paddingVertical: 20,
                            paddingHorizontal: 12,
                        }}>
                        {showConfirmModal ? (
                            deletingUserAccount ? (
                                <ActivityIndicator color="#FCDA80"/>
                            ) : (
                                <>
                                    <Text style={styles.warningText}>Warning!</Text>

                                    <Text style={styles.warningMessage}>
                                        Deleting your account will cancel all your active bookings.
                                        Cancellation refunds are not guarenteed and are subject to
                                        vendor policies.
                                    </Text>

                                    <Text style={styles.warningSubMessage}>
                                        Please tap on the button below to navigate to reservations
                                        page to manage your bookings.
                                    </Text>
                                    <Text
                                        onPress={() => {
                                            setShowDeleteAccountModal(false);
                                            props.navigation.toggleDrawer();
                                            props.navigation.navigate('Bookings');
                                        }}
                                        style={styles.reservationButton}>
                                        Go to Reservations page
                                    </Text>

                                    <View style={styles.confirmButtonContainer}>
                                        <Pressable
                                            disabled={!enableDeleteButton}
                                            style={{marginLeft: 12}}
                                            onPress={async () => {
                                                setDeletingUserAccount(true);
                                                deleteUserAccount()
                                                    .then(() => {
                                                        Toast.show('Account removed');
                                                        setTimeout(() => {
                                                            setShowDeleteAccountModal(false);
                                                            logoutFunction(props.navigation);
                                                        }, 1000);
                                                    })
                                                    .catch(() => {
                                                        Toast.show('Account deletion failed!');
                                                        setDeletingUserAccount(false);
                                                    });
                                            }}>
                                            <Text style={styles.confirmButtonText}>
                                                Confirm Delete
                                            </Text>
                                        </Pressable>

                                        <Pressable onPress={() => setShowDeleteAccountModal(false)}>
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </Pressable>
                                    </View>
                                </>
                            )
                        ) : (
                            <>
                                <Text style={styles.deleteAccountTitle}>
                                    Are you sure you want to delete* your account?
                                </Text>

                                <Text style={styles.deleteAccountMessage}>
                                    Please type "Delete" to enable the delete button
                                </Text>

                                <TextInput
                                    onChangeText={setDeleteTextInput}
                                    selectionColor="#FCDA80"
                                    style={styles.deleteAccountTextInput}
                                />

                                <View style={styles.confirmButtonContainer}>
                                    <Pressable
                                        disabled={!enableDeleteButton}
                                        style={{marginLeft: 12}}
                                        onPress={() => {
                                            setShowConfirmModal(true);
                                        }}>
                                        <Text
                                            style={{
                                                color: enableDeleteButton ? 'red' : 'gray',
                                                fontSize: 16,
                                                fontFamily: configs.FONTS.PRIMARY_FONT,
                                            }}>
                                            Delete Account
                                        </Text>
                                    </Pressable>

                                    <Pressable onPress={() => setShowDeleteAccountModal(false)}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </Pressable>
                                </View>

                                <Text style={styles.finePrint}>
                                    *Account deletion is a permanent action. Once deleted, all the
                                    data accociated with you account will be permanently erased.
                                </Text>
                            </>
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#161A46d0',
        height: '100%',
        padding: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderColor: '#FCDA80',
        borderRightWidth: 1,
    },
    avatarContainer: {
        width: '90%',
        height: 80,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginLeft: 10,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        resizeMode: 'cover',
    },
    avatar: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        borderColor: '#FCDA80',
        borderWidth: 1,
    },
    avatarName: {
        fontFamily: configs.FONTS.SECONDARY_FONT,
        fontSize: 20,
        marginLeft: 20,
        color: configs.COLORS.whitePrimary,
    },
    appInfoContainer: {
        position: 'absolute',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 20,
        alignSelf: 'center',
    },
    appInfoLogo: {
        height: 100,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    appInfoText: {
        fontFamily: configs.FONTS.PRIMARY_FONT,
        fontSize: 12,
        color: '#FCDA80',
    },
    changeCityContainer: {
        width: '90%',
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginLeft: 10,
    },
    cityIcon: {
        width: 10,
        height: 10,
        borderRadius: 20,
        backgroundColor: '#FCDA80',
    },
    city: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        borderColor: '#FCDA80',
        borderWidth: 1,
    },
    cityName: {
        fontFamily: configs.FONTS.PRIMARY_FONT,
        fontSize: 17,
        marginLeft: 20,
        color: configs.COLORS.whitePrimary,
        lineHeight: 24,
    },
    logoutOut: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteAccountButtonText: {
        fontFamily: configs.FONTS.PRIMARY_FONT,
        fontSize: 17,
        color: configs.COLORS.whitePrimary,
        lineHeight: 24,
        marginLeft: 4,
    },
    modalBg: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningText: {
        color: '#fff',
        fontFamily: configs.FONTS.PRIMARY_FONT,
    },
    warningMessage: {
        color: '#fff',
        marginTop: 12,
        fontSize: 12,
        fontFamily: configs.FONTS.PRIMARY_FONT,
    },
    warningSubMessage: {
        color: '#fff',
        marginTop: 12,
        fontSize: 10,
        fontFamily: configs.FONTS.PRIMARY_FONT,
    },
    reservationButton: {
        color: '#fff',
        marginTop: 4,
        fontSize: 14,
        textDecorationLine: 'underline',
        fontFamily: configs.FONTS.PRIMARY_FONT,
    },
    confirmButtonContainer: {flexDirection: 'row-reverse', marginTop: 12},
    confirmButtonText: {
        color: 'red',
        fontSize: 16,
        fontFamily: configs.FONTS.PRIMARY_FONT,
    },
    cancelButtonText: {fontSize: 16, color: '#fff'},
    deleteAccountTitle: {
        color: '#fff',
        fontFamily: configs.FONTS.PRIMARY_FONT,
    },
    deleteAccountMessage: {
        color: '#fff',
        marginTop: 12,
        fontSize: 10,
        fontFamily: configs.FONTS.PRIMARY_FONT,
    },
    deleteAccountTextInput: {
        borderWidth: 1,
        borderColor: '#FCDA80',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginTop: 8,
        backgroundColor: '#fff',
        fontFamily: configs.FONTS.PRIMARY_FONT,
        color: '#161A46',
    },
    finePrint: {
        color: '#fff',
        marginTop: 12,
        fontSize: 8,
        fontFamily: configs.FONTS.PRIMARY_FONT,
    },
});
