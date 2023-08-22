import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import {
  Text,
  Pressable,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { trackEventNormal, trackScreen } from "../../controller/analytics";
import { setDisplayName } from "../../controller/auth";

const UserSignUp = (props) => {
  const { navigation = () => null } = props;
  const [response, setResponse] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userNameInput, setUserNameInput] = useState("");

  useEffect(() => {
    setIsLoading(true);
    AsyncStorage.getItem("@auth")
      .then((data) => JSON.parse(data))
      .then((data) => {
        setResponse(data ?? {});
        setUserNameInput(data?.user?.displayName);
      })
      .finally(() => {
        setIsLoading(false);
      });
    trackScreen("SignUp");
  }, []);

  const handleProfileSubmit = async () => {
    try {
      setIsLoading(true);
      const updatedUserData = await setDisplayName({
        token: response?.token,
        displayName: userNameInput,
      });
      await AsyncStorage.setItem(
        "@auth",
        JSON.stringify({ token: response?.token, user: updatedUserData?.data })
      );
    } catch (e) {
    } finally {
      setIsLoading(false);
      navigation.jumpTo("App");
      AsyncStorage.setItem("@firstTime", "set");
    }
  };

  // await trackEventNormal('Register')

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "gray",
        justifyContent: "flex-start",
        paddingTop: 100,
      }}
    >
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 18,
          backgroundColor: "#fff",
          //   borderTopLeftRadius: 30,
          //   borderTopRightRadius: 30,
          borderRadius: 30,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "600",
                marginBottom: 16,
                color: "#000",
              }}
            >
              Sign up!
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "400", color: "#000" }}>
              Provide your name to get started!
            </Text>

            <Text style={{ marginTop: 16, color: "#000" }}>Name</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#E3E5E6",
                borderRadius: 5,
                paddingHorizontal: 20,
                // paddingVertical: 12,
                marginTop: 8,
              }}
            >
              <TextInput
                style={styles.input}
                value={userNameInput}
                onChangeText={setUserNameInput}
                placeholder="Enter name"
              />
            </View>

            {!_.isEmpty(response?.user?.phone) && (
              <View>
                <Text style={{ marginTop: 24, color: "#000" }}>
                  Phone Number
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#E3E5E6",
                    borderRadius: 5,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    marginTop: 8,
                    backgroundColor: "#efefef",
                  }}
                >
                  <Text style={{ letterSpacing: 4 }}>
                    {response?.user?.phone}
                  </Text>
                </View>
              </View>
            )}

            {!_.isEmpty(response?.user?.email) && (
              <View>
                <Text style={{ marginTop: 24, color: "#000" }}>Email</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#E3E5E6",
                    borderRadius: 5,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    marginTop: 8,
                    backgroundColor: "#efefef",
                  }}
                >
                  <Text style={{ color: "#000" }}>{response?.user?.email}</Text>
                </View>
              </View>
            )}

            <Pressable
              onPress={() => {
                handleProfileSubmit();
              }}
              style={{
                backgroundColor: "#4A4A4A",
                padding: 12,
                alignItems: "center",
                borderRadius: 12,
                marginTop: 24,
              }}
            >
              <Text style={{ color: "rgba(255, 236, 187, 1)" }}>Sign up</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

export default UserSignUp;

const styles = StyleSheet.create({
  input: {
    height: 40,
    color: "#000",
  },
});
