import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { FlatList, TextInput } from "react-native-gesture-handler";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useSelector } from "react-redux";

import FloatingButton from "../../components/floatingButton";
import { LocationPicker } from "../../components/locationPicker";
import { VendorCard } from "../../components/vendorCard";
import { trackScreen } from "../../controller/analytics";
import { getFavourites } from "../../controller/user";
import { configs } from "../../values/config";

const Favourites = ({ navigation }) => {
  const [favouritesList, setFavouritesList] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();
  const [listToRender, setListToRender] = useState(null);
  const [searchText, setSearchText] = useState("");
  const { selectedCity } = useSelector((state) => state.city);

  useEffect(() => {
    const filteredList = [];
    _.forEach(favouritesList, (item) => {
      if (item?.resource_id?.general_information?.location == selectedCity) {
        filteredList.push(item);
      }
    });
    setListToRender(filteredList);
  }, [selectedCity, isFocused, favouritesList]);

  useEffect(() => {
    if (!_.isEmpty(searchText)) {
      const searchList = [];
      _.forEach(favouritesList, (item) => {
        if (
          _.includes(
            item.resource_id.general_information.name
              .toLowerCase()
              .replace(/'/, ""),
            searchText.toLowerCase().replace(" ", "")
          )
        ) {
          searchList.push(item);
        }
      });
      setListToRender(searchList);
    } else {
      setListToRender(null);
    }
  }, [searchText]);

  useEffect(() => {
    loadData();
    setSearchText("");
  }, [isFocused]);

  const loadData = async () => {
    setIsLoading(true);
    let favouritesList = (await getFavourites()).data;
    favouritesList = _.filter(
      favouritesList,
      (item) => item.resource_id?.general_information
    );
    setFavouritesList(favouritesList);
    setTimeout(() => {
      setIsLoading(false);
    }, 80);
  };
  trackScreen("Favourites");
  return (
    <SafeAreaView style={styles.container} forceInset={{ bottom: "never" }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16 }}>
          {/* header */}
          <View style={styles.headerContainer}>
            <Text style={{ fontSize: 24, fontWeight: "600", color: "#000" }}>
              Favourites
            </Text>
          </View>

          {/* search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchTextInputView}>
              <FontAwesome5 name="search" size={14} color="#4A4A4A" />
              <TextInput
                style={[
                  { marginLeft: 12, flex: 1 },
                  Platform.OS === "ios" && {
                    padding: 12,
                  },
                ]}
                placeholder="Search by name..."
                onChangeText={setSearchText}
                value={searchText}
              />
            </View>
          </View>
        </View>
        {/* location picker */}
        <View style={{ paddingHorizontal: 16, marginTop: 12, zIndex: 999 }}>
          <LocationPicker />
        </View>

        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            ListEmptyComponent={
              <View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "600",
                    color: "#000",
                    textAlign: "center",
                  }}
                >
                  No Favourites Saved!
                </Text>
              </View>
            }
            data={_.reverse(listToRender) ?? _.reverse(favouritesList)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              return (
                <View style={{ paddingHorizontal: 16 }}>
                  <VendorCard
                    navigation={navigation}
                    vendorData={{
                      ...item?.resource_id,
                      favourite: { xxx: "xxx" },
                      resource_type: item?.resource_type,
                    }}
                  />
                </View>
              );
            }}
          />
        )}
      </View>
      {/*<FloatingButton />*/}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchTextInputView: {
    // paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#DFE1E6",
    flex: 1,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: configs.COLORS.whitePrimary,
  },
  headerContainer: { flexDirection: "row", justifyContent: "space-between" },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 40,
    marginBottom: 120,
    zIndex: 999,
  },
  appIconImage: {
    width: 38,
    height: 38,
  },
  locationInitialContainer: { flexDirection: "row" },
  dropdownIconContainer: {
    justifyContent: "center",
    height: "100%",
    paddingTop: 8,
  },
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
  categoryButton: {
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

export default Favourites;
