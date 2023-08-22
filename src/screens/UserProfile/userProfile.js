import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import _, { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import {
  Text,
  SafeAreaView,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Toast from "react-native-simple-toast";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useDispatch } from "react-redux";

import FloatingButton from "../../components/floatingButton";
import UserAvatar from "../../components/userAvatar";
import { trackScreen } from "../../controller/analytics";
import { setDisplayName, deleteUserAccount } from "../../controller/auth";
import firebaseSetup from "../../firebase";
import { configs } from "../../values/config";

const PageHeader = (props) => {
  const {
    onBack = null,
    navigation = null,
    pageTitle = "",
    containerStyle = {},
  } = props;
  return (
    <View style={containerStyle}>
      <Pressable
        hitSlop={20}
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => {
          if (_.isFunction(onBack)) {
            onBack();
          } else if (navigation) {
            navigation?.goBack();
          }
        }}
      >
        <FontAwesome5
          name="angle-left"
          size={16}
          color="rgba(74, 74, 74, 1)"
          style={{ marginRight: 12 }}
          brand
        />
        <Text style={{ fontSize: 14, color: "#000" }}>{pageTitle}</Text>
      </Pressable>
    </View>
  );
};

const UserProfileCard = (props) => {
  const { userDetails = {}, onEditProfilePress = () => null } = props;
  return (
    <View style={[styles.userProfileContainer, styles.shadow]}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ color: "#000" }}>{userDetails?.displayName}</Text>
          {!_.isEmpty(userDetails?.phone) && (
            <Text style={{ marginTop: 8, letterSpacing: 2, color: "#000" }}>
              {userDetails?.phone}
            </Text>
          )}
          {!_.isEmpty(userDetails?.email) && (
            <Text style={{ marginTop: 4, color: "#000" }}>
              {userDetails?.email}
            </Text>
          )}
        </View>
        <View>
          <UserAvatar size={56} />
        </View>
      </View>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <Pressable onPress={onEditProfilePress} hitSlop={20}>
          <Text
            style={{
              color: "rgba(90, 12, 26, 1)",
              fontWeight: "500",
              fontSize: 14,
            }}
          >
            Edit Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const ProfileOptionsCard = (props) => {
  const {
    title = null,
    containerStyle = {},
    onPress = () => null,
    showRightArrow = true,
    titleLeftIcon = null,
    textStyle = {},
  } = props;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          backgroundColor: "#fff",
          borderRadius: 4,
          marginBottom: 16,
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "space-between",
        },
        styles.shadow,
        containerStyle,
      ]}
    >
      <Text style={[{ color: "#000" }, textStyle]}>
        {titleLeftIcon}
        {titleLeftIcon && "  "}
        {title}
      </Text>
      {showRightArrow && (
        <FontAwesome5
          name="angle-right"
          size={20}
          color="rgba(74, 74, 74, 1)"
          style={{ marginRight: 12 }}
          brand
        />
      )}
    </Pressable>
  );
};

const UserProfile = (props) => {
  const { navigation = () => null, userDetails = {} } = props;

  // hooks
  const dispatch = useDispatch();

  // states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [enableSaveProfile, setEnableSaveProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState({});
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingUserAccount, setDeletingUserAccount] = useState(false);
  const [deleteTextInput, setDeleteTextInput] = useState("");

  const enableDeleteButton = deleteTextInput.toLocaleLowerCase() === "delete";

  // effect
  useEffect(() => {
    loadUserDetails();
    trackScreen("UserProfile");
  }, []);

  // functions
  const loadUserDetails = () => {
    setIsLoading(true);
    AsyncStorage.getItem("@auth")
      .then((data) => JSON.parse(data))
      .then((data) => {
        setResponse(data ?? {});
        setUserName(data?.user?.displayName);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateUserName = async () => {
    setIsLoading(true);
    try {
      const updatedUserData = await setDisplayName({
        token: response?.token,
        displayName: userName,
      });
      await AsyncStorage.setItem(
        "@auth",
        JSON.stringify({ token: response?.token, user: updatedUserData?.data })
      );
    } catch (e) {
    } finally {
      setShowEditProfileModal(false);
      loadUserDetails();
    }
  };

  const userLogout = async (navigation) => {
    console.log("Logout Pressed");
    const { auth } = firebaseSetup();
    try {
      await auth?.().signOut?.();
      const currentUser = await GoogleSignin.getCurrentUser();
      if (!isEmpty(currentUser)) {
        await GoogleSignin.signOut();
      }
      await AsyncStorage.removeItem("@auth");
      await AsyncStorage.removeItem("@firstTime");
      dispatch({
        type: "LOGOUT",
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
      <View style={{ flex: 1 }}>
        <PageHeader
          navigation={navigation}
          pageTitle="Profile"
          containerStyle={{ paddingHorizontal: 16 }}
        />
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <ActivityIndicator style={{ paddingVertical: 40 }} size="large" />
          ) : (
            <ScrollView style={{ paddingVertical: 16 }}>
              <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
                <UserProfileCard
                  userDetails={response?.user}
                  onEditProfilePress={() => {
                    setShowEditProfileModal(true);
                  }}
                />
              </View>

              <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
                <ProfileOptionsCard
                  title="Reservations"
                  onPress={() => {
                    navigation?.push?.("Reservations");
                  }}
                />
                <ProfileOptionsCard
                  title="About Mufasa"
                  onPress={async () => {
                    navigation?.push?.("AboutMufasa");
                  }}
                />
                <ProfileOptionsCard
                  title="Need Help?"
                  onPress={() => {
                    navigation?.push?.("NeedHelp");
                  }}
                />
              </View>
            </ScrollView>
          )}

          <View style={{ paddingHorizontal: 16 }}>
            <ProfileOptionsCard
              showRightArrow={false}
              titleLeftIcon={
                <FontAwesome5
                  name="sign-out-alt"
                  size={16}
                  color="rgba(74, 74, 74, 1)"
                  style={{ marginRight: 12 }}
                />
              }
              title="Logout"
              onPress={() => {
                Alert.alert("Logout", "Do you wish to logout?", [
                  {
                    text: "Logout",
                    onPress: userLogout,
                  },
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                  },
                ]);
              }}
            />
            {Platform.OS === "ios" && (
              <ProfileOptionsCard
                showRightArrow={false}
                titleLeftIcon={
                  <FontAwesome5
                    name="trash"
                    size={16}
                    color="rgba(212, 37, 37, 1)"
                    style={{ marginRight: 12 }}
                  />
                }
                title="Delete Account"
                textStyle={{ color: "rgba(212, 37, 37, 1)" }}
                onPress={() => {
                  setShowDeleteAccountModal(true);
                }}
              />
            )}
          </View>
        </View>
      </View>

      <Modal animationType="fade" visible={showDeleteAccountModal} transparent>
        <SafeAreaView style={styles.modalBg}>
          <View
            style={{
              width: "90%",
              backgroundColor: "#161A46e9",
              borderWidth: 1,
              borderColor: "#FCDA80",
              borderRadius: 12,
              paddingVertical: 20,
              paddingHorizontal: 12,
            }}
          >
            {showConfirmModal ? (
              deletingUserAccount ? (
                <ActivityIndicator color="#FCDA80" />
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
                      setShowConfirmModal(false);
                      setDeleteTextInput("");
                      navigation?.push?.("Reservations");
                    }}
                    style={styles.reservationButton}
                  >
                    Go to Reservations page
                  </Text>

                  <View style={styles.confirmButtonContainer}>
                    <Pressable
                      disabled={!enableDeleteButton}
                      style={{ marginLeft: 12 }}
                      onPress={async () => {
                        setDeletingUserAccount(true);
                        deleteUserAccount()
                          .then(() => {
                            Toast.show("Account removed");
                            setTimeout(() => {
                              setShowDeleteAccountModal(false);
                              userLogout(props.navigation);
                            }, 1000);
                          })
                          .catch(() => {
                            Toast.show("Account deletion failed!");
                            setDeletingUserAccount(false);
                          });
                      }}
                    >
                      <Text style={styles.confirmButtonText}>
                        Confirm Delete
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setShowDeleteAccountModal(false);
                        setShowConfirmModal(false);
                        setDeleteTextInput("");
                      }}
                    >
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
                    style={{ marginLeft: 12 }}
                    onPress={() => {
                      setShowConfirmModal(true);
                    }}
                  >
                    <Text
                      style={{
                        color: enableDeleteButton ? "red" : "gray",
                        fontSize: 16,
                        fontFamily: configs.FONTS.PRIMARY_FONT,
                      }}
                    >
                      Delete Account
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowDeleteAccountModal(false);
                      setShowConfirmModal(false);
                      setDeleteTextInput("");
                    }}
                  >
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

      <Modal
        visible={showEditProfileModal}
        presentationStyle="formSheet"
        onRequestClose={() => setShowEditProfileModal(false)}
        animationType="slide"
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "#fff",
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 12,
                paddingVertical: 20,
              }}
            >
              <Text style={{ color: "#000" }}>Edit Profile</Text>
              <Pressable
                hitSlop={20}
                onPress={() => {
                  setShowEditProfileModal(false);
                }}
              >
                <FontAwesome5
                  name="times"
                  size={16}
                  color="rgba(74, 74, 74, 1)"
                  style={{ marginRight: 12 }}
                  brand
                />
              </Pressable>
            </View>

            <View style={{ alignItems: "center", marginVertical: 48 }}>
              <UserAvatar size={56} />
            </View>

            <View style={{ paddingHorizontal: 16 }}>
              <UserProfileEditField
                title="Name"
                containerStyle={{ marginBottom: 16 }}
                textInputProps={{
                  value: userName,
                  onChangeText: (value) => {
                    setUserName(value);
                    if (_.isEmpty(value)) {
                      setEnableSaveProfile(false);
                    } else if (!enableSaveProfile) {
                      setEnableSaveProfile(true);
                    }
                  },
                }}
                textStyle={{ fontWeight: "600" }}
              />
              {!_.isEmpty(response?.user?.phone) && (
                <UserProfileEditField
                  title="Phone Number"
                  textInputStyle={{
                    marginTop: 4,
                    backgroundColor: "#efefef",
                    letterSpacing: 2,
                  }}
                  textStyle={{ fontWeight: "600" }}
                  containerStyle={{ marginBottom: 16 }}
                  textInputProps={{
                    editable: false,
                    value: response?.user?.phone,
                  }}
                />
              )}
              {!_.isEmpty(response?.user?.email) && (
                <UserProfileEditField
                  title="Email"
                  textInputStyle={{ marginTop: 4, backgroundColor: "#efefef" }}
                  textInputProps={{
                    editable: false,
                    value: response?.user?.email,
                  }}
                  textStyle={{ fontWeight: "600" }}
                />
              )}
            </View>
          </View>

          <Pressable
            onPress={() => {
              updateUserName();
              setEnableSaveProfile(false);
            }}
            disabled={!enableSaveProfile}
            style={{
              padding: 16,
              backgroundColor: enableSaveProfile ? "#5A0C1A" : "gray",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff" }}>SAVE PROFILE</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>

      {/*<FloatingButton bottomMargin={80} />*/}
    </SafeAreaView>
  );
};

const UserProfileEditField = (props) => {
  const {
    title = "",
    containerStyle = {},
    textInputProps = {},
    textInputStyle = {},
    textStyle = {},
  } = props;

  return (
    <View style={containerStyle}>
      <Text style={[{ color: "#000", marginBottom: 4 }, textStyle]}>
        {title}
      </Text>
      <TextInput
        {...textInputProps}
        style={[
          {
            borderWidth: 1,
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 10,
            borderColor: "#ddd",
          },
          textInputStyle,
        ]}
      />
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  userProfileContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  shadow: {
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalBg: {
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  warningText: {
    color: "#fff",
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
  warningMessage: {
    color: "#fff",
    marginTop: 12,
    fontSize: 12,
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
  warningSubMessage: {
    color: "#fff",
    marginTop: 12,
    fontSize: 10,
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
  reservationButton: {
    color: "#fff",
    marginTop: 4,
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
  confirmButtonContainer: { flexDirection: "row-reverse", marginTop: 12 },
  confirmButtonText: {
    color: "red",
    fontSize: 16,
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
  cancelButtonText: { fontSize: 16, color: "#fff" },
  deleteAccountTitle: {
    color: "#fff",
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
  deleteAccountMessage: {
    color: "#fff",
    marginTop: 12,
    fontSize: 10,
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
  deleteAccountTextInput: {
    borderWidth: 1,
    borderColor: "#FCDA80",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
    backgroundColor: "#fff",
    fontFamily: configs.FONTS.PRIMARY_FONT,
    color: "#161A46",
  },
  finePrint: {
    color: "#fff",
    marginTop: 12,
    fontSize: 8,
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
});
