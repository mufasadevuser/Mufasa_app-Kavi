import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useDispatch, useSelector } from "react-redux";

import DUBAI from "../../assets/images/dubai.png";
import GOA from "../../assets/images/goa.png";
// import THAILAND from "../../assets/images/thailand.png";
import { trackEventNormal } from "../controller/analytics";

const locationsList = [
  { label: "Goa", value: "Goa" },
  { label: "Dubai", value: "Dubai" },
  { label: "Thailand", value: "Thailand" },
];

const LocationPicker = () => {
  const dispatch = useDispatch();
  const { selectedCity } = useSelector((state) => state.city || "Goa");

  const [openLocationList, setOpenLocationList] = useState(false);

  return (
    <View style={styles.locationContainer}>
      <View style={styles.locationInitialContainer}>
        <Pressable
          style={styles.locationEndContainer}
          onPress={() => {
            setOpenLocationList((val) => !val);
          }}
        >
          <Image
            source={
              selectedCity === "Goa"
                ? GOA
                : selectedCity === "Dubai"
                ? DUBAI
                : 'THAILAND'
            }
            style={{ height: 32, width: 32 }}
          />
        </Pressable>
        <DropDownPicker
          items={locationsList}
          open={openLocationList}
          setOpen={() => setOpenLocationList((val) => !val)}
          value={selectedCity}
          setValue={async (setValueFunction) => {
            const selectedValue = setValueFunction();
            dispatch({
              type: "CITY",
              payload: {
                selectedCity: selectedValue,
              },
            });
            await AsyncStorage.setItem("@city", selectedValue);
            await trackEventNormal("Home_page_Location_" + selectedValue);
          }}
          style={styles.dropdownStyle}
          containerStyle={{ width: 130 }}
          disableBorderRadius
          arrowIconStyle={{ width: 12, height: 12 }}
          textStyle={{
            fontSize: 16,
            textAlign: "left",
          }}
          labelStyle={{
            textAlign: "center",
          }}
        />
      </View>
    </View>
  );
};

export { LocationPicker };

const styles = StyleSheet.create({
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 40,
    marginBottom: 20,
    zIndex: 999,
  },
  locationInitialContainer: { flexDirection: "row" },
  dropdownStyle: {
    borderWidth: 0,
    flex: 1,
    height: "auto",
  },
  locationEndContainer: {
    justifyContent: "center",
    height: "100%",
    paddingTop: 8,
  },
});
