import PhoneInput from "@josarcsal/react-native-phone-number-input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import analytics from "@react-native-firebase/analytics";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import _ from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import appsFlyer from "react-native-appsflyer";
import { ScrollView } from "react-native-gesture-handler";
import OtpInputs from "react-native-otp-inputs";
// import PhoneInput from "react-native-phone-number-input";
import { Screen } from "react-native-screens";
import Toast from "react-native-simple-toast";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";

import { trackEventNormal, trackScreen } from "../../controller/analytics";
import { register } from "../../controller/auth";
import firebaseSetup from "../../firebase";
import { configs } from "../../values/config";
const phoneInput = useRef < PhoneInput > null;

const ResentOtp = ({ onResend }) => {
  const [currentSecond, setTimer] = useState(60);
  const removeTimer = useRef();

  useEffect(() => {
    if (currentSecond > 0) {
      removeTimer.current = setTimeout(() => {
        setTimer((oldSecond) => oldSecond - 1);
      }, 1000);
    } else {
      clearTimeout(removeTimer.current);
    }
    return () => {
      clearTimeout(removeTimer.current);
    };
  }, [currentSecond]);

  return (
    <View style={styles.eight}>
      <Pressable
        onPress={async () => {
          await onResend?.(true);
          setTimer(59);
        }}
        disabled={currentSecond > 0}
      >
        <Text style={styles.resendText}>
          Resend {currentSecond > 0 ? " : " : "?"}
          {currentSecond > 0 && (
            <Text style={styles.nine}>
              00:{currentSecond > 9 ? currentSecond : `0${currentSecond}`}
            </Text>
          )}
        </Text>
      </Pressable>
    </View>
  );
};

const UserLogin = (props) => {
  const { auth } = firebaseSetup();
  const { navigation = () => null } = props;

  // states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [otpNumber, setOtpNumber] = useState(null);
  const [showOtpLayout, setShowOtpLayout] = useState(false);
  const [loginConfirm, setLoginConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCTA, setShowCTA] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [valid, setValid] = useState(false);
  const phoneInput = useRef(null);

  // hooks
  const removeAuthListner = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    trackScreen("UserLogin");
  }, []);
  // effects

  useEffect(() => {
    setLoginConfirm(null);
    setIsLoading(false);
    setIsVerifying(false);
  }, [phoneNumber]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => backHandler.remove();
  }, [showOtpLayout]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      _keyboardDidShow
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      _keyboardDidHide
    );

    GoogleSignin.configure({
      webClientId: configs.GOOGLE_WEB_CLIENT_ID,
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (loginConfirm?._verificationId) {
      setShowOtpLayout(true);
      removeAuthListner.current = auth?.()?.onAuthStateChanged?.((data) => {
        if (data?._user?.uid) {
          verifyOtpCode(true);
        }
      });

      return () => {
        removeAuthListner?.current?.();
      };
    }
  }, [loginConfirm]);

  // functions
  const onBackPress = () => {
    if (showOtpLayout) {
      setShowOtpLayout(false);
      setIsLoading(false);
      setIsVerifying(false);
    } else {
      Alert.alert("Hold on!", "Are you sure you want to exit!", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        { text: "YES", onPress: () => BackHandler.exitApp() },
      ]);
    }
    return true;
  };

  const _keyboardDidShow = useCallback(() => {
    setShowCTA(true);
  }, []);

  const _keyboardDidHide = useCallback(() => {
    setShowCTA(true);
  }, []);

  const verifyOtpCode = async (codeAutoVerified = false) => {
    try {
      setIsVerifying(true);
      removeAuthListner?.current?.();

      if (!codeAutoVerified) {
        await loginConfirm?.confirm(otpNumber);
      }

      const idToken = await auth?.()?.currentUser?.getIdToken?.();

      const res = await register({
        phone: auth().currentUser.phoneNumber ?? formattedPhoneNumber,
        displayName: "",
        userId: auth().currentUser.uid,
        loginType: "phone",
        userType: "customer",
        email: "",
        photo: "0",
        firebaseToken: idToken,
      });

      const loginData = JSON.stringify(res?.data);
      await AsyncStorage.setItem("@auth", loginData);
      if (!loginData?.user?.displayName) {
        await trackEventNormal("Register", {});
      }
      await analytics().setUserId(
        auth().currentUser.phoneNumber ?? formattedPhoneNumber
      );
      await analytics().setUserProperty(
        "crm_id",
        auth().currentUser.phoneNumber ?? formattedPhoneNumber
      );
      appsFlyer.setCustomerUserId(
        auth().currentUser.phoneNumber ?? formattedPhoneNumber
      );

      dispatch({
        type: "LOGGED_IN_USER",
        payload: res?.data,
      });
    } catch (e) {
      Alert.alert(
        "Login error",
        (e?.userInfo?.code &&
          e?.userInfo?.code?.replaceAll("-", " ")?.toUpperCase?.()) ??
          e?.message
      );
      setIsLoading(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const currentUser = await GoogleSignin.getCurrentUser();
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
      const loginData = JSON.stringify(data);
      await AsyncStorage.setItem("@auth", loginData);

      await analytics().setUserId(currentUser.user.email);
      await analytics().setUserProperty("crm_id", currentUser.user.email);
      appsFlyer.setCustomerUserId(currentUser.user.email);

      dispatch({
        type: "LOGGED_IN_USER",
        payload: data,
      });
    } catch (err) {
      console.log(err);
      Toast.show("Google Sign in action cancelled!");
    } finally {
      setIsLoading(false);
    }
  };

  const signWithPhoneNumber = async (forceResend = false) => {
    const number =
      Platform.OS === "android" ? formattedPhoneNumber : phoneNumber;
    console.log(number);
    await trackEventNormal("Login_page_Login_button");
    try {
      if (_.isEmpty(number)) {
        throw new Error("Please enter a valid phone number");
      }
      setIsLoading(true);
      if (loginConfirm?._verificationId) {
        setShowOtpLayout(true);
      } else {
        const loginConfirmation = await auth?.()?.signInWithPhoneNumber?.(
          number,
          forceResend
        );
        setLoginConfirm(loginConfirmation);
      }
    } catch (e) {
      console.log(e);
      Alert.alert(
        "Login error",
        (e?.userInfo?.code &&
          e?.userInfo?.code?.replaceAll("-", " ")?.toUpperCase?.()) ??
          e?.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getGoogleCredentials = async () => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    // <SafeAreaView style={styles.one}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Screen style={styles.one}>
        {Platform.OS === "android" ? (
          <StatusBar backgroundColor="transparent" translucent />
        ) : null}
        {showOtpLayout ? (
          <View style={styles.otpMainStyle}>
            <View style={styles.otpheader}>
              <View style={styles.two}>
                <View style={styles.logootp}>
                  <Image
                    source={require("../../../assets/images/icons/logoIcon.png")}
                    style={styles.four}
                    resizeMode="contain"
                  />
                  <Text style={styles.logootptext}>MUFASA</Text>
                </View>

                {showOtpLayout ? (
                  /* otp */
                  <View style={styles.six}>
                    <Pressable
                      style={{ flexDirection: "row", alignItems: "center" }}
                      onPress={() => {
                        setIsLoading(false);
                        setShowOtpLayout(false);
                        setIsVerifying(false);
                      }}
                    >
                      <MaterialIcons
                        name="arrow-back-ios"
                        size={12}
                        color="#000"
                      />
                      <Text style={styles.seven}>Mobile OTP</Text>
                    </Pressable>
                    <OtpInputs
                      handleChange={(code) => setOtpNumber(code)}
                      numberOfInputs={6}
                      style={styles.otpField}
                      inputStyles={styles.otpFields}
                      autofillFromClipboard
                      autofillListenerIntervalMS={100000}
                    />
                    <ResentOtp onResend={signWithPhoneNumber} />
                    <Text style={styles.belowOtpText}>
                      You will receive an SMS verification that may apply
                      message and data rates.
                    </Text>
                  </View>
                ) : (
                  /* welcome */
                  <View style={styles.ten}>
                    {/*<Text style={styles.eleven}>Welcome</Text>*/}

                    <Text style={styles.twelve}>Login to Mufasa</Text>

                    <PhoneInput
                      ref={phoneInput}
                      defaultValue={phoneNumber}
                      defaultCode="IN"
                      layout="second"
                      onChangeText={(text) => {
                        setPhoneNumber(text);
                      }}
                      onChangeFormattedText={(text) => {
                        setFormattedPhoneNumber(text);
                      }}
                      withDarkTheme={false}
                      autoFocus={false}
                      containerStyle={styles.thirteen}
                      textContainerStyle={{ backgroundColor: "#fff" }}
                      placeholder="Enter Mobile number"
                      textInputStyle={styles.textphoneInput}
                      textInputProps={{ maxLength: 10 }}
                    />
                  </View>
                )}

                {/* cta */}
                {showCTA && (
                  <View style={styles.fourteen}>
                    {showOtpLayout ? (
                      <Pressable
                        disabled={isVerifying}
                        onPress={() => {
                          verifyOtpCode();
                        }}
                        style={styles.eighteen}
                      >
                        {isVerifying ? (
                          <ActivityIndicator />
                        ) : (
                          <Text style={styles.nineteen}>Verify</Text>
                        )}
                      </Pressable>
                    ) : (
                      <View>
                        <Pressable
                          // disabled={valid}
                          onPress={() => {
                            console.log("Login button clicked");
                            const checkValid =
                              phoneInput.current?.isValidNumber(phoneNumber);
                            console.log("Valid Phone Number :" + checkValid);
                            // setShowMessage(true);
                            setValid(checkValid ? checkValid : false);
                            signWithPhoneNumber();
                          }}
                          style={styles.eighteen}
                        >
                          {isLoading ? (
                            <ActivityIndicator />
                          ) : (
                            <Text style={styles.nineteen}>Login</Text>
                          )}
                        </Pressable>

                        {Platform.OS === "android" && (
                          <View>
                            <View style={styles.twenty}>
                              <Text style={styles.twentyOne}>Or</Text>
                            </View>

                            <Pressable
                              disabled={isLoading}
                              style={styles.twentyTwo}
                              onPress={async () => {
                                await trackEventNormal(
                                  "Login_page_Continue_with_google"
                                );
                                await getGoogleCredentials();
                                await verifyGoogleLogin();
                              }}
                            >
                              <View style={styles.twenty3}>
                                <Image
                                  source={require("../../../assets/images/icons/google.png")}
                                  style={styles.twentyFour}
                                  resizeMode="contain"
                                />
                                {isLoading ? (
                                  <ActivityIndicator />
                                ) : (
                                  <Text style={styles.twentyFive}>
                                    Continue with Google
                                  </Text>
                                )}
                              </View>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}

                {/*<View style = {styles.lineStyle} />*/}
                {/*<Text style={styles.textfourteen}>Don’t have an account?</Text>*/}
                {/*<Text style={styles.textfourteenSignup}>Sign up Now</Text>*/}
              </View>
            </View>
            <View style={styles.otpfooter}>
              <Image
                source={require("../../../assets/images/new_otp_image.jpg")}
                style={styles.otpfooterImage}
              />
            </View>
          </View>
        ) : (
          <View style={styles.one}>
            <View style={styles.header2}>
              <Image
                source={require("../../../assets/images/login-image.jpg")}
                style={styles.headerImage}
              />
              {/* <View
                style={{
                  position: "absolute",
                  top: 50,
                  left: 20,
                  right: 0,
                  bottom: 0,
                }}
              >
                <Text style={styles.headerText}>
                  Exqusite{"\n"}Experiences{"\n"}with Ease
                </Text>
              </View> */}
            </View>
            <View style={styles.footer2}>
              <ScrollView>
                <View style={styles.two}>
                  <View style={styles.three}>
                    <Image
                      source={require("../../../assets/images/icons/logoIcon.png")}
                      style={styles.four}
                      resizeMode="contain"
                    />
                    <Text style={styles.five}>MUFASA</Text>
                  </View>

                  {showOtpLayout ? (
                    /* otp */
                    <View style={styles.six}>
                      <Pressable
                        style={{ flexDirection: "row", alignItems: "center" }}
                        onPress={() => {
                          setIsLoading(false);
                          setShowOtpLayout(false);
                          setIsVerifying(false);
                        }}
                      >
                        <MaterialIcons
                          name="arrow-back-ios"
                          size={12}
                          color="#000"
                        />
                        <Text style={styles.seven}>Mobile OTP</Text>
                      </Pressable>
                      <OtpInputs
                        handleChange={(code) => setOtpNumber(code)}
                        numberOfInputs={6}
                        style={styles.otpField}
                        inputStyles={styles.otpFields}
                        autofillFromClipboard
                        autofillListenerIntervalMS={100000}
                      />
                      <ResentOtp onResend={signWithPhoneNumber} />
                    </View>
                  ) : (
                    /* welcome */
                    <View style={styles.ten}>
                      {/*<Text style={styles.eleven}>Welcome</Text>*/}

                      <Text style={styles.twelve}>Login to Mufasa</Text>
                      {Platform.OS === "android" ? (
                        <PhoneInput
                          ref={phoneInput}
                          defaultValue={phoneNumber}
                          defaultCode="IN"
                          layout="second"
                          onChangeText={(text) => {
                            setPhoneNumber(text);
                          }}
                          onChangeFormattedText={(text) => {
                            setFormattedPhoneNumber(text);
                          }}
                          withDarkTheme={false}
                          autoFocus={false}
                          containerStyle={styles.thirteen}
                          textContainerStyle={{ backgroundColor: "#fff" }}
                          placeholder="Enter Mobile number"
                          textInputStyle={styles.textphoneInput}
                          textInputProps={{ maxLength: 10 }}
                        />
                      ) : (
                        <View>
                          <TextInput
                            style={styles.input}
                            onChangeText={(text) => {
                              setPhoneNumber(text);
                            }}
                            value={phoneNumber}
                            placeholder="Provide the phone number with country code"
                            placeholderTextColor="#808080"
                            keyboardType="phone-pad"
                          />
                          <Text style={styles.phoneNumberSample}>
                            Eg : +971 52 503 0289
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/*<Text style={styles.fourteen}>*/}
                  {/*  You will receive an SMS verification that may apply message and data*/}
                  {/*  rates.*/}
                  {/*</Text>*/}

                  {/* cta */}
                  {showCTA && (
                    <View style={styles.fourteen}>
                      <View>
                        <Pressable
                          onPress={() => {
                            console.log("Login cliked");
                            const checkValid =
                              phoneInput.current?.isValidNumber(phoneNumber);
                            console.log("Valid Phone Number :" + checkValid);
                            // setShowMessage(true);
                            setValid(checkValid ? checkValid : false);
                            signWithPhoneNumber();
                          }}
                          style={styles.eighteen}
                        >
                          {isLoading ? (
                            <ActivityIndicator />
                          ) : (
                            <Text style={styles.nineteen}>Login</Text>
                          )}
                        </Pressable>

                        {Platform.OS === "android" && (
                          <View>
                            <View style={styles.twenty}>
                              <Text style={styles.twentyOne}>Or</Text>
                            </View>

                            <Pressable
                              // disabled={valid}
                              style={styles.twentyTwo}
                              onPress={async () => {
                                await trackEventNormal(
                                  "Login_page_Continue_with_google"
                                );
                                await getGoogleCredentials();
                                await verifyGoogleLogin();
                              }}
                            >
                              <View style={styles.twenty3}>
                                <Image
                                  source={require("../../../assets/images/icons/google.png")}
                                  style={styles.twentyFour}
                                  resizeMode="contain"
                                />
                                {isLoading ? (
                                  <ActivityIndicator />
                                ) : (
                                  <Text style={styles.twentyFive}>
                                    Continue with Google
                                  </Text>
                                )}
                              </View>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/*<View style = {styles.lineStyle} />*/}
                  {/*<Text style={styles.textfourteen}>Don’t have an account?</Text>*/}
                  {/*<Text style={styles.textfourteenSignup}>Sign up Now</Text>*/}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Screen>
    </TouchableWithoutFeedback>
    // </SafeAreaView>
  );
};

export default UserLogin;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "#009387",
  },

  lineStyle: {
    borderWidth: 0.5,
    borderColor: "black",
    margin: 5,
  },
  otpfooter: {
    position: "absolute",
    left: 0,
    right: -1,
    top: 400,
    bottom: 0,
    backgroundColor: "#fff",
  },
  footer2: {
    position: "absolute",
    left: 0,
    right: -1,
    top: 280,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerImage: {
    width: "100%",
  },
  otpfooterImage: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: "cover",
  },

  otpheader: {
    position: "absolute",
    width: "100%",
  },
  header2: {
    position: "absolute",
    width: "100%",
  },
  otpField: {
    width: "100%",
    elevation: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  otpFields: {
    backgroundColor: "#fff",
    width: 45,
    height: 50,
    textAlign: "center",
    borderRadius: 5,
    color: "#000",
    elevation: 10,
    shadowColor: "rgba(0,0,0,0.51)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },

  one: { flex: 1, backgroundColor: "#fff" },
  otpMainStyle: { flex: 1, backgroundColor: "#fff" },
  two: { paddingHorizontal: 16, flex: 1 },
  three: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 33,
    marginTop: 35,
  },

  logootp: {
    flexDirection: "row",
    marginBottom: 33,
    marginTop: 45,
  },

  four: {
    width: 38,
    height: 38,
    marginRight: 16,
  },
  five: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: configs.FONTS.SECONDARY_FONT,
    color: "rgba(208, 167, 60, 1)",
  },

  logootptext: {
    fontSize: 20,
    fontWeight: "800",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    fontFamily: configs.FONTS.SECONDARY_FONT,
    color: "rgba(208, 167, 60, 1)",
  },
  six: { marginBottom: 36 },
  seven: { fontSize: 12, fontWeight: "500", color: "#4A4A4A" },
  eight: { alignItems: "center", marginTop: 12 },
  nine: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: configs.FONTS.PRIMARY_FONT,
    color: "#EE6C32",
  },
  ten: { marginBottom: 18 },
  eleven: {
    fontSize: 32,
    fontWeight: "bold",
    color: "rgba(74, 74, 74, 1)",
    marginBottom: 8,
  },
  twelve: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(74, 74, 74, 1)",
    marginBottom: 28,
    textAlign: "center",
  },

  resendText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4A4A",
    marginBottom: 28,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    textAlign: "center",
  },

  belowOtpText: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: configs.FONTS.PRIMARY_FONT,
    color: "rgba(74, 74, 74, 1)",
    textAlign: "left",
    marginTop: 10,
  },

  textfourteen: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4A4A",
    marginBottom: 5,
    marginTop: 28,
    textAlign: "center",
  },

  textfourteenSignup: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5A0C1A",
    textAlign: "center",
  },

  thirteen: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(227, 229, 229, 1)",
  },

  fourteen: {
    fontSize: 12,
    fontWeight: "400",
    color: "rgba(74, 74, 74, 1)",
    marginBottom: 38,
  },

  textphoneInput: {
    width: "100%",
    height: 48,
    fontSize: 17,
    overflow: "hidden",
  },
  fifteen: {
    // backgroundColor: 'gray',
    flex: 1,
    borderRadius: 30,
    padding: 16,
    justifyContent: "flex-end",
  },
  sixteen: {
    backgroundColor: "#FFECBB",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  seventeen: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
  },
  eighteen: {
    backgroundColor: "#FFECBB",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  nineteen: {
    fontSize: 18,
    fontWeight: "500",
    color: "#494949",
  },
  twenty: {
    backgroundColor: "transparent",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  twentyOne: {
    fontSize: 13,
    fontWeight: "400",
    color: "#4A4A4A",
  },
  twentyTwo: {
    backgroundColor: "#F1F6FB",
    height: 48,
    borderRadius: 12,
    elevation: 5,
  },
  twenty3: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  twentyFour: {
    width: 24,
    height: 24,
    marginRight: 16,
    position: "absolute",
    left: 16,
  },
  twentyFive: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(74, 74, 74, 1)",
  },
  headerText: {
    fontSize: 36,
    color: "rgba(255, 255, 255, 1)",
    fontWeight: "500",
    fontFamily: configs.FONTS.CORMORANT_GARAMOND_REGULAR,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  phoneNumberSample: {
    marginLeft: 12,
    marginRight: 12,
    color: "#808080",
  },
});
