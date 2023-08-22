import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SimpleAnimation } from "react-native-simple-animations";
import Toast from "react-native-simple-toast";
import { useDispatch, useSelector } from "react-redux";

import { GoogleButton, InputPhone, Submit, SubTitle } from "../../components";
import { register } from "../../controller/auth";
import firebaseSetup from "../../firebase";
import { configs } from "../../values/config";
import Verification from "./Verification";

// import {appleAuth, AppleButton} from '@invertase/react-native-apple-authentication';

const DeviceWidth = Dimensions.get("window").width;
const DeviceHeight = Dimensions.get("window").height;

const GoogleConfirmModal = ({ visible, setVisible, googleLoginConfirm }) => {
  const handleConfirm = async () => {
    googleLoginConfirm();
    setVisible(!visible);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        setVisible(!visible);
      }}
      transparent
    >
      <View style={styles.innerModalContainer}>
        <View style={styles.googleConfirmContainer}>
          <Image
            style={styles.logo}
            source={require("../../../assets/images/logo.png")}
          />
          <Text style={styles.askPermissionText}>
            Allow Mufasa to access your Name & Email
          </Text>
          <TouchableOpacity
            onPress={() => handleConfirm()}
            style={styles.googleConfirmButton}
          >
            <Text style={styles.allowText}>Allow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const Login = (props) => {
  const { auth } = firebaseSetup(); //firebase auth
  const [user, setUser] = useState({
    email: "",
    displayName: "",
    userId: "",
    loginType: "",
    phone: "",
    userType: "customer",
  });
  const dispatch = useDispatch();

  const [phone, setPhone] = useState(""); //mobile input state
  const [loader, setLoader] = useState(false); //otp loader state
  const [verified, setVerified] = useState(false); //otp verified tick state
  const [formattedValue, setFormattedValue] = useState(""); //phone number with country code state
  const [verifyBox, setVerifyBox] = useState(false); //otp modal visibility state
  const [googleConfirm, setGoogleConfirm] = useState(false);
  const [timer, setTimer] = useState(0); //send again timer
  const [googleLoader, setGoogleLoader] = useState(false);
  const [confirm, setConfirm] = useState(null); //Phone Auth
  const [code, setCode] = useState("");
  const [showLoginCard, setShowLoginCard] = useState(true);
  const [lasOtpSentOn, setLasOtpSentOn] = useState(null);

  const removeAuthListner = useRef();
  const removeTimer = useRef();

  const isFocused = useIsFocused();

  const clearStates = useCallback(() => {
    setPhone("");
    setLoader(false);
    setVerified(false);
    setFormattedValue("");
    setVerifyBox(false);
    setGoogleConfirm(false);
    setTimer(0);
    setGoogleLoader(false);
    setConfirm(null);
    setCode("");
    setShowLoginCard(false);

    removeAuthListner?.current?.();
    clearTimeout(removeTimer?.current);
  }, []);

  useEffect(() => {
    setTimer(0);
    setLoader(false);
    setVerified(false);
    setVerifyBox(false);
  }, [formattedValue]);

  useEffect(() => {
    if (isFocused) {
      setShowLoginCard(true);
    }
  }, [isFocused]);

  useEffect(() => {
    if (timer > 0) {
      removeTimer.current = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else {
      clearTimeout(removeTimer.current);
    }

    return () => {
      clearTimeout(removeTimer.current);
    };
  }, [timer]);

  useEffect(() => {
    props.navigation.navigate("Reservations");
    BackHandler.addEventListener("hardwareBackPress", () => true);
  }, []);

  useEffect(() => {
    if (confirm?._verificationId) {
      setVerifyBox(true);

      removeAuthListner.current = auth().onAuthStateChanged((user) => {
        if (user) {
          confirmCode(true);
        }
      });

      return () => {
        removeAuthListner.current();
      };
    }
  }, [confirm]);

  const handleSubmit = () => {
    if (formattedValue.length > 7) {
      if (timer === 0 || lasOtpSentOn !== formattedValue) {
        setTimer(60);
        setVerified(false);
        setLoader(true);
        signWithPhoneNumber(formattedValue);
        setLasOtpSentOn(formattedValue);
      } else {
        setVerifyBox(true);
      }
      // setTimeout(() => setVerifyBox(!verifyBox), 2000);
    } else if (phone === "") {
      Toast.show("Please enter mobile number"); //handle null
    } else {
      Toast.show("Please enter a valid mobile number"); //handle length
    }
  };

  const signWithPhoneNumber = async (phoneNumber) => {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (e) {
      setTimer(0);
      setLoader(false);
      Toast.show("Login failed, please try again!");
      alert(e);
    }
  };

  const confirmCode = async (isCodeVerified = false) => {
    try {
      removeAuthListner.current();

      if (!isCodeVerified) {
        await confirm?.confirm(code);
      }

      const idToken = await auth().currentUser.getIdToken();

      setVerifyBox(!verifyBox);

      const res = await register({
        phone: auth().currentUser.phoneNumber,
        displayName: "",
        userId: auth().currentUser.uid,
        loginType: "phone",
        userType: "customer",
        email: "",
        photo: "0",
        firebaseToken: idToken,
      });
      dispatch({
        type: "LOGGED_IN_USER",
        payload: res.data,
      });

      clearTimeout(removeTimer.current);
      setLoader(false);
      setVerified(true);

      await AsyncStorage.setItem("@auth", JSON.stringify(res.data));
      if (res.data.user.photo === "0") {
        props.navigation.navigate("Profile", { user: res.data });
        // setTimeout(
        //   () => props.navigation.navigate('Profile', {user: res.data}),
        //   1000,
        // );
      } else {
        props.navigation.navigate("OnBoard");
        // setTimeout(() => props.navigation.navigate('OnBoard'), 1000);
      }

      clearStates();
    } catch (e) {
      Toast.show("Incorrect OTP");
      setTimer(0);
    } finally {
      setLoader(false);
    }
  };
  const { userAuth } = useSelector((state) => ({ ...state }));

  //Google Auth
  //Google Config

  const checkLoggedIn = async () => {
    const user = await AsyncStorage.getItem("@auth");
    const u = JSON.parse(user);
    if (/*userAuth && userAuth.token*/ u && u.token) {
      props.navigation.navigate("Home");
    }
    GoogleSignin.configure({
      webClientId: configs.GOOGLE_WEB_CLIENT_ID,
    });
  };
  useEffect(() => {
    checkLoggedIn();
  }, []);
  //Google Auth Setup
  const [googleUser, setGoogleUser] = useState(null);
  const GoogleLogin = async () => {
    setGoogleLoader(true);
    try {
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      return auth().signInWithCredential(googleCredential);
    } catch (err) {
      console.log(err);
    }
  };
  const googleUserInfo = async () => {
    setGoogleConfirm(true);
    let currentUser;
    try {
      currentUser = await GoogleSignin.getCurrentUser();
      const idToken = await auth().currentUser.getIdToken();
      const { data } = await register({
        email: currentUser.user.email,
        phone: null,
        displayName: currentUser.user.name,
        userId: currentUser.user.id,
        loginType: "google",
        userType: "customer",
        firebaseToken: idToken,
      });
      dispatch({
        type: "LOGGED_IN_USER",
        payload: data,
      });
      await AsyncStorage.setItem("@auth", JSON.stringify(data));

      if (data.user.photo != null) {
        props.navigation.navigate("OnBoard");
        // setTimeout(() => props.navigation.navigate('OnBoard'), 1000);
      } else {
        props.navigation.navigate("Profile", { user: data });
        // setTimeout(
        //   () => props.navigation.navigate('Profile', {user: data}),
        //   1000,
        // );
      }

      setGoogleLoader(false);
    } catch (err) {
      Toast.show("Login failed, please try again!");
      setGoogleLoader(false);
      console.log(err);
    }
    // setGoogleUser(currentUser.user);
  };

  const finalGoogleLogin = async () => {
    await GoogleLogin();
    await googleUserInfo();
  };

  // //Apple Auth Function
  // async function onAppleButtonPress() {
  //     // Start the sign-in request
  //     const appleAuthRequestResponse = await appleAuth.performRequest({
  //         requestedOperation: appleAuth.Operation.LOGIN,
  //         requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  //     });
  //
  //     // Ensure Apple returned a user identityToken
  //     if (!appleAuthRequestResponse.identityToken) {
  //         throw 'Apple Sign-In failed - no identify token returned';
  //     }
  //
  //     // Create a Firebase credential from the response
  //     const { identityToken, nonce } = appleAuthRequestResponse;
  //     const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
  //
  //     // Sign the user in with the credential
  //     return auth().signInWithCredential(appleCredential);
  // };

  return (
    <ImageBackground
      imageStyle={styles.loginBack}
      source={require("../../../assets/images/backgrounds/loginBg.jpg")}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.innerContainer}>
          <View style={styles.headerContainer}>
            <SimpleAnimation
              aim="in"
              delay={500}
              duration={1500}
              animate
              animateOnUpdate={false}
              movementType="slide"
              distance={200}
              direction="right"
            >
              <Image
                style={styles.logo}
                source={require("../../../assets/images/logo.png")}
              />
            </SimpleAnimation>
            <SimpleAnimation
              aim="in"
              delay={800}
              duration={1000}
              animate
              animateOnUpdate={false}
              movementType="slide"
              distance={20}
              direction="down"
            >
              <SubTitle
                text="Exquisite Experiences, Effortlessly"
                size={14}
                align="left"
                color={configs.COLORS.whiteAccent}
              />
            </SimpleAnimation>
          </View>

          {showLoginCard && (
            <SimpleAnimation
              aim="in"
              delay={1000}
              duration={1500}
              animate
              animateOnUpdate={false}
              movementType="slide"
              distance={200}
              direction="up"
            >
              <View style={styles.formContainer}>
                <InputPhone
                  value={phone}
                  setValue={setPhone}
                  label="Phone Number"
                  setFormattedValue={setFormattedValue}
                  loader={loader}
                  verified={verified}
                />
                <Submit label="Send OTP" handleSubmit={handleSubmit} />
                <View style={styles.socialContainer}>
                  {Platform.OS === "android" ? (
                    <GoogleButton
                      handleSubmit={finalGoogleLogin}
                      loader={googleLoader}
                    />
                  ) : null}
                </View>
                <View style={styles.bottomContainer}>
                  <Text style={styles.text}>Join us and Explore...</Text>
                </View>
              </View>
            </SimpleAnimation>
          )}

          <Verification
            visible={verifyBox}
            setVisible={setVerifyBox}
            code={code}
            setCode={setCode}
            confirmCode={confirmCode}
            mobile={formattedValue}
            time={timer}
            setTime={setTimer}
            resend={handleSubmit}
          />
        </View>
        {/* <GoogleConfirmModal
          googleLoginConfirm={finalGoogleLogin}
          visible={googleConfirm}
          setVisible={setGoogleConfirm}
        /> */}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: configs.COLORS.darkBlue,
    justifyContent: "space-between",
  },
  containerBackground: {
    resizeMode: "cover",
  },
  headerContainer: {
    marginTop: 50,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    marginVertical: 30,
    marginHorizontal: 30,
    backgroundColor: "#161A46E0",
    borderRadius: 20,
    borderColor: "#E8C873",
    borderWidth: 1,
    padding: 20,
    width: DeviceWidth - 60,
  },
  socialContainer: {
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  googleButton: {
    width: "100%",
    height: 55,
  },
  appleButton: {
    width: "100%",
    height: 50,
  },
  bottomContainer: {
    width: "100%",
    flexDirection: "row",
    marginVertical: 15,
    justifyContent: "center",
  },
  text: {
    color: configs.COLORS.whitePrimary,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontSize: 14,
    textAlign: "left",
  },
  linkText: {
    color: configs.COLORS.goldenRegular,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontSize: 14,
    textAlign: "left",
  },
  loginBack: {
    minHeight: DeviceHeight,
    resizeMode: "cover",
  },
  innerContainer: {
    borderColor: "#FCDA80",
    borderWidth: 2,
    borderRadius: 20,
    margin: 15,
    alignItems: "center",
    flex: 1,
  },
  logo: {
    height: 120,
    resizeMode: "contain",
  },
  modalContainer: {
    width: DeviceWidth,
    height: DeviceHeight,
  },
  innerModalContainer: {
    width: DeviceWidth,
    height: DeviceHeight,
    backgroundColor: "#000000B0",
    justifyContent: "center",
    alignItems: "center",
  },
  googleConfirmContainer: {
    width: DeviceWidth - 100,
    height: 300,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  askPermissionText: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    color: "#000",
    textAlign: "center",
    fontSize: 17,
  },
  googleConfirmButton: {
    width: 200,
    height: 50,
    backgroundColor: "#4285F4",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  allowText: {
    color: configs.COLORS.whitePrimary,
    fontSize: 18,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

export default Login;
