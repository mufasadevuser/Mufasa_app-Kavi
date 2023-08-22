import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  RefreshControl,
  Platform,
} from "react-native";
import { FlatList, TextInput } from "react-native-gesture-handler";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import FloatingButton from "../../components/floatingButton";
import { ReservationCard } from "../../components/reservationCard";
import { trackScreen } from "../../controller/analytics";
import { allBookings } from "../../controller/auth";
import { configs } from "../../values/config";

const Reservations = () => {
  const isFocused = useIsFocused();
  // states
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState(null);
  const [listToRender, setListToRender] = useState(null);

  // functions
  const loadUserBookings = async () => {
    const auth = await AsyncStorage.getItem("@auth");
    const u = JSON.parse(auth);
    try {
      const { data } = await allBookings(u.token, u.user._id);
      setBookings(data);
      setLoading(false);
      const upComingBookings = [];
      const completedBookings = [];
      const allBs = bookings;
      allBs.sort(
        (a, b) =>
          moment(a.booking_info?.date, "Do MMM YYYY").format("YYYYMMDD") -
          new moment(b.booking_info?.date, "Do MMM YYYY").format("YYYYMMDD")
      );
      for (let i = 0; i < allBs?.length; i++) {
        if (
          moment(allBs[i].booking_info?.date, "Do MMM YYYY").format(
            "YYYYMMDD"
          ) >= moment(new Date()).format("YYYYMMDD")
        ) {
          upComingBookings.push(allBs[i]);
        } else {
          completedBookings.push(allBs[i]);
        }
      }
      setRefreshing(false);
    } catch (err) {
      console.log(err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserBookings();
    if (!loading) {
      loadAgain();
    } else {
      setRefreshing(false);
    }
  };

  const loadAgain = () => {
    const upComingBookings = [];
    const completedBookings = [];
    const allBs = bookings;
    allBs.sort(
      (a, b) =>
        moment(a.booking_info?.date, "Do MMM YYYY").format("YYYYMMDD") -
        new moment(b.booking_info?.date, "Do MMM YYYY").format("YYYYMMDD")
    );
    for (let i = 0; i < allBs?.length; i++) {
      if (
        moment(allBs[i].booking_info?.date, "Do MMM YYYY").format("YYYYMMDD") >=
        moment(new Date()).format("YYYYMMDD")
      ) {
        upComingBookings.push(allBs[i]);
      } else {
        completedBookings.push(allBs[i]);
      }
    }
  };

  useEffect(() => {
    trackScreen("Reservations");
  }, []);

  // effects
  useEffect(() => {
    loadUserBookings();
    if (!loading) {
      loadAgain();
    }
  }, [loading, isFocused]);

  useEffect(() => {
    if (!_.isEmpty(searchText)) {
      const searchList = [];
      _.forEach(bookings, (item) => {
        const data =
          item?.club ?? item?.activity ?? item?.service ?? item?.restaurant;

        if (
          _.includes(
            data?.general_information?.name?.toLowerCase().replace(/'/, ""),
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

  return (
    <SafeAreaView
      style={styles.container}
      forceInset={{ bottom: "never" }}
      onRefresh={onRefresh}
    >
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16 }}>
          {/* header */}
          <View style={styles.headerContainer}>
            <Text style={{ fontSize: 24, fontWeight: "600", color: "#000" }}>
              Reservations
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
                placeholder="Search by name"
                onChangeText={setSearchText}
              />
            </View>
          </View>
        </View>

        {/* location picker */}
        {/* <LocationPicker /> */}

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
                No Bookings Found!
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={listToRender ?? bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            return (
              <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
                <ReservationCard
                  reservationInfo={item}
                  reloadBookings={onRefresh}
                />
              </View>
            );
          }}
        />
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

export default Reservations;
