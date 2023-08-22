import React from "react";
import { Image, StyleSheet, TouchableOpacity, Linking } from "react-native";

const FloatingButton = (props) => {
  const { bottomMargin = 20 } = props;

  const clickHandler = () => {
    //function to handle click on floating Action Button, here opening the whatsapp chat
    Linking.openURL(`https://wa.me/+919380934624`);
  };
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={clickHandler}
      style={[
        styles.touchableOpacityStyle,
        {
          bottom: bottomMargin,
        },
      ]}
    >
      <Image
        source={require("../../assets/images/login-image.jpg")}
        style={styles.floatingButtonStyle}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchableOpacityStyle: {
    position: "absolute",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
  },
  floatingButtonStyle: {
    resizeMode: "contain",
    width: 40,
    height: 40,
    //backgroundColor:'black'
  },
});

export default FloatingButton;
