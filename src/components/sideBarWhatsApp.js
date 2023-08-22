import React from "react";
import { Linking, TouchableOpacity, View } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const sideBarWhatsApp = ({ showPopup, setShowPopup }) => {
  return (
    <View
      style={{
        position: "absolute",
        zIndex: 100,
        backgroundColor: showPopup ? "white" : "#E0BF89",
        height: 60,
        right: 0,
        bottom: 70,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "grey",
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
      }}
    >
      {!showPopup ? (
        <TouchableOpacity
          onPress={() => setShowPopup(true)}
          style={{ marginHorizontal: 3 }}
          hitSlop={{ top: 25, bottom: 25, left: 5, right: 5 }}
        >
          <FontAwesome5 name="arrow-left" color="grey" size={15} />
        </TouchableOpacity>
      ) : null}

      {showPopup ? (
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => Linking.openURL(`https://wa.me/${+919380934624}`)}
          style={{ marginLeft: 15, marginRight: 15 }}
          hitSlop={{ top: 7, bottom: 7, left: 13, right: 13 }}
        >
          <FontAwesome5 name="whatsapp" color="#25D366" size={45} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default sideBarWhatsApp;
