import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import { configs } from "../values/config";

const UserAvatar = (props) => {
  const { size = 32 } = props;

  const [user, setUser] = useState(null);

  const loadUser = async () => {
    const auth = await AsyncStorage.getItem("@auth");
    const u = JSON.parse(auth);
    setUser(u?.user);
  };

  useEffect(() => {
    // loadUser();
    setUser({
      photo: "2",
    });
  }, []);

  return user?.photo ? (
    <View
      style={[
        styles.container,
        {
          height: size,
          width: size,
          borderRadius: size / 2,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.1)",
        },
      ]}
    >
      <FontAwesome5Icon
        name="user"
        size={size * 0.65}
        color="rgba(90, 12, 26, 1)"
      />
      {/* <Image
        // source={{uri: `${configs.PUBLIC_URL}/profiles/${user.photo}.png`}}
        resizeMode="contain"
        source={{
          uri: 'https://www.fairtravel4u.org/wp-content/uploads/2018/06/sample-profile-pic.png',
        }}
        style={styles.image}
      /> */}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: { flex: 1 },
});

export default UserAvatar;
