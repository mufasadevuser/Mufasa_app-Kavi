import AsyncStorage from "@react-native-async-storage/async-storage";
// import { usePaymentSheet, useStripe } from "@stripe/stripe-react-native";
import { CardField, confirmPayment } from "@stripe/stripe-react-native";
import axios from "axios";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-simple-toast";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useSelector } from "react-redux";

import FloatingButton from "../../components/floatingButton";
import { trackEventNormal, trackScreen } from "../../controller/analytics";
import { bookActivity } from "../../controller/experience";
import {
  bookClub,
  bookEvent,
  bookResto,
  bookService,
} from "../../controller/exquisite";
import { getCurrentUser, handleApiFail } from "../../helpers/authHelper";
import { configs } from "../../values/config";
import { makePayment } from "../Payment";

const initiatePayment = async ({
  resource_id,
  resource_type,
  package_id,
  payment_gateway,
}) => {
  const user = await getCurrentUser();

  const response = await axios
    .post(
      `${configs.BASE_URL}/payment/stage/initiate`,
      {
        resource_type,
        resource_id,
        package_id,
        payment_gateway,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      }
    )
    .catch(handleApiFail);

  return response?.data;
};

const PackageBooking = (props) => {
  const { navigation = null, route = {} } = props;
  const { params = {} } = route;
  const { packageDetails, vendorData, categoryColor = "#5A0C1A" } = params;

  // hooks
  // const { initPaymentSheet } = useStripe().initPaymentSheet();
  // const { loading: paymentSheetLoading, presentPaymentSheet } =
  //   usePaymentSheet();
  const selectedCity = vendorData?.general_information?.location ?? "Goa";

  // consts
  const {
    title = "",
    price = null,
    package_details = [],
    index = 0,
    prices,
  } = packageDetails;

  const rawPrice = price || prices?.singleday?.[0]?.price;

  const priceInNumber = rawPrice?.replace(/\D/g, "");
  // priceInNumber = parseInt(price, 10);

  const resource_id = vendorData?._id;
  const package_id = packageDetails?._id;
  const payment_gateway = selectedCity === "Goa" ? "Razorpay" : "Stripe";

  /** states */
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("DD-MM-YYYY")
  );
  const [selectedTime, setSelectedTime] = useState(moment().format("hh:mm A"));
  const [guestName, setGuestName] = useState(null);
  const [numberOfGuest, setNumberOfGuest] = useState(null);
  const [specialRequest, setSpecialRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSheetParams, setPaymentSheetParams] = useState({});
  const [rawDate, setRawDate] = useState(new Date());
  const [userDetail, setUserDetail] = useState({});

  /** effect */
  useEffect(() => {
    getCurrentUser().then(setUserDetail);
    trackScreen("PackageBooking");
  }, []);

  useEffect(() => {
    if (selectedCity === "Dubai") {
      // initializeStripePaymentSheet({
      //   resource_id,
      //   resource_type: vendorData?.resource_type,
      //   package_id,
      //   payment_gateway,
      // });
    }
  }, [selectedCity]);

  /** function */

  // stripe methods
  // const initializeStripePaymentSheet = async ({
  //   resource_id,
  //   resource_type,
  //   package_id,
  //   payment_gateway,
  // }) => {
  //   setIsLoading(true);
  //
  //   if (
  //     _.isNaN(priceInNumber) ||
  //     _.isNull(priceInNumber) ||
  //     _.isUndefined(priceInNumber)
  //   ) {
  //     setIsLoading(false);
  //     return;
  //   }
  //
  //   initiatePayment({
  //     resource_id,
  //     resource_type,
  //     package_id,
  //     payment_gateway,
  //   })
  //     .then(async (data) => {
  //       const { paymentIntent, ephemeralKey, customer } = data || {};
  //       setPaymentSheetParams(data);
  //       const initSheetData = await initPaymentSheet({
  //         customerId: customer,
  //         customerEphemeralKeySecret: ephemeralKey,
  //         paymentIntentClientSecret: paymentIntent,
  //         allowsDelayedPaymentMethods: false,
  //         merchantDisplayName: "Mufasa",
  //         defaultBillingDetails: {
  //           address: {
  //             country: "AE",
  //           },
  //         },
  //       });
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       Alert.alert("Payment initilisation failed.");
  //     });
  // };

  const openPaymentSheet = async () => {
    try {
      setIsLoading(true);
      const paymentStatus = await presentPaymentSheet();
      if (paymentStatus?.error) {
        throw paymentStatus?.error?.message;
      }
      Alert.alert("Success", "Your order is confirmed!");
      return true;
    } catch (error) {
      setIsLoading(false);
      Alert.alert(`Payment failed`, error);
      return false;
    }
  };

  const handlePayment = async ({ u, payment_user }) => {
    const commonData = {
      id: vendorData?._id,
      guestName,
      guestContact: userDetail?.phone ?? userDetail?.email,
      guestCount: numberOfGuest,
      specialRequest,
      date: rawDate,
      time: rawDate,
      option: packageDetails,
    };

    if (
      _.isNaN(priceInNumber) ||
      _.isNull(priceInNumber) ||
      _.isUndefined(priceInNumber)
    ) {
      Toast.show("Booking Successful");
      return commonData;
    }

    if (selectedCity === "Dubai" || selectedCity === "Thailand") {
      //Stripe Payment
      const data = await new Promise((resolve) => {
        navigation.navigate("StripePayment", {
          onPaymentSuccess: resolve,
          amount: commonData?.option?.price,
          currency: selectedCity === "Dubai" ? "aed" : "thb",
        });
        setIsLoading(false);
      });
      if (!data?.paymentIntent?.id) throw new Error("Payment Failure");
      const booking = {
        ...commonData,
        payment: {
          payment_id: data?.paymentIntent?.id,
          payment_gateway: "stripe",
        },
      };
      return booking;
    } else if (selectedCity === "Goa") {
      // razorpay
      const data = await initiatePayment({
        resource_id,
        resource_type: vendorData.resource_type,
        package_id,
        payment_gateway,
      });
      console.log(booking, "final");
      const { amount, currency, id: orderId } = data || {};
      await makePayment({
        selectedCity,
        amount,
        user: payment_user,
        orderId,
        currency,
      });
      const razorpayPaymentId = await AsyncStorage.getItem("@payment");

      if (!razorpayPaymentId) throw new Error("Payment Failed");
      const booking = {
        ...commonData,
        payment: {
          payment_id: razorpayPaymentId,
          payment_gateway: "razorpay",
        },
      };
      return booking;
    }
  };

  const handleReservation = async () => {
    const validTime = validateWithCurrentTime(rawDate);
    if (validTime) {
      await trackEventNormal("Package_Reservation_page_Confirm");
      const user = await AsyncStorage.getItem("@auth");
      const u = JSON.parse(user);
      setIsLoading(true);

      try {
        const payment_user = {
          contact: userDetail?.phone ?? userDetail?.email,
          displayName: guestName,
        };

        switch (vendorData?.resource_type) {
          case configs.VENDOR_TYPES.CLUB: {
            const booking = await handlePayment({ u, payment_user });
            await bookClub(u.token, booking);
            break;
          }
          case configs.VENDOR_TYPES.EVENT: {
            const booking = await handlePayment({ u, payment_user });
            await bookEvent(u.token, booking);
            break;
          }
          case configs.VENDOR_TYPES.RESTAURANT: {
            const booking = await handlePayment({ u, payment_user });
            await bookResto(u.token, booking);
            break;
          }
          case configs.VENDOR_TYPES.ACTIVITY: {
            const booking = await handlePayment({ u, payment_user });
            await bookActivity(u.token, booking);
            break;
          }
          case configs.VENDOR_TYPES.SERVICE: {
            const booking = await handlePayment({ u, payment_user });
            await bookService(u.token, booking);
            break;
          }
          default:
            throw new Error("Unknown service type");
        }

        // Toast.show('Booking Successful');
        if (navigation?.canGoBack?.()) {
          await navigation?.popToTop?.();
          navigation?.jumpTo?.("Reservations");
        }
      } catch (err) {
        Toast.show("Booking Unsuccessful");
        if (navigation?.canGoBack?.()) {
          await navigation?.pop?.();
        }
      } finally {
        setIsLoading(false);
        await AsyncStorage.removeItem("@payment");
      }
    } else {
      Alert.alert("Verify the time", "Please make a future time selection!", [
        { text: "OK", onPress: () => setDatePickerVisibility(true) },
      ]);
    }
  };

  const validateWithCurrentTime = (time) => {
    const from = new Date(Date.parse(time));
    const to = new Date(Date.parse(new Date()));
    if (from < to) return false;
    return true;
  };

  const handleDateSelection = (data) => {
    const date = moment(data).format("DD-MM-YYYY");
    const time = moment(data).format("hh:mm A");

    const validTime = validateWithCurrentTime(data);

    if (validTime) {
      setSelectedDate(date);
      setSelectedTime(time);
      setRawDate(data);
    } else
      Alert.alert("Verify the time", "Please make a future time selection!", [
        { text: "OK", onPress: () => setDatePickerVisibility(true) },
      ]);
    setDatePickerVisibility(false);
  };

  const onClickNumberOfPackages = (text) => {
    setNumberOfGuest(text.replace(/\D/g, ""));
  };

  const createPaymentIntent = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:4002/payment-sheet",
        data
      );
      alert("success");
      return response.data; // Optionally return the response data if needed
    } catch (error) {
      alert(error);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        <Pressable
          style={{ flexDirection: "row" }}
          hitSlop={20}
          onPress={() => {
            navigation?.goBack?.();
          }}
        >
          <FontAwesome5
            name="angle-left"
            size={16}
            color="#000"
            style={{ marginRight: 12 }}
          />
          <Text>Package {index + 1}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, marginTop: 24 }}
        contentInset={{ bottom: 32 }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 24 }}>
          Please fill in your information to confirm your reservation
        </Text>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.inputTitle}>Reservation time</Text>
          <Pressable
            onPress={() => {
              setDatePickerVisibility(true);
            }}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 4,
              backgroundColor: "#f5f5f5",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 3,
            }}
          >
            <Text>{selectedDate}</Text>
            <Text>{selectedTime}</Text>
            <FontAwesome5
              name="calendar-alt"
              size={16}
              color="#000"
              style={{ marginRight: 12 }}
            />
          </Pressable>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleDateSelection}
            onCancel={() => {
              setDatePickerVisibility(false);
            }}
            minimumDate={new Date()}
            buttonTextColorIOS={categoryColor}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.inputTitle}>Guest name*</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Full Name"
            onChangeText={setGuestName}
            value={guestName}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.inputTitle}>Number of packages*</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Number of packages"
            keyboardType="numeric"
            onChangeText={onClickNumberOfPackages}
            value={numberOfGuest}
          />
        </View>

        <View style={{ marginBottom: 34 }}>
          <Text style={styles.inputTitle}>Special Requests</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Special Requests"
            onChangeText={setSpecialRequest}
            value={specialRequest}
            multiline
          />
        </View>

        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 20 }}>
          Package Summary
        </Text>

        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.summarySubtitle, { color: categoryColor }]}>
            Package Name
          </Text>
          <Text style={styles.summaryContentText}>{title}</Text>
        </View>
        {!_.isEmpty(price) ? (
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.summarySubtitle, { color: categoryColor }]}>
              Package Price
            </Text>
            <Text style={styles.summaryContentText}>{price}</Text>
          </View>
        ) : null}

        {/* {price && (
          <View style={{marginBottom: 20}}>
            <Text style={[styles.summarySubtitle, {color: categoryColor}]}>
              Package Price
            </Text>
            <Text style={styles.summaryContentText}>{price}</Text>
          </View>
        )} */}
      </ScrollView>
      <Pressable
        disabled={_.isEmpty(guestName) || _.isEmpty(numberOfGuest) || isLoading}
        style={{
          backgroundColor:
            _.isEmpty(guestName) || _.isEmpty(numberOfGuest) || isLoading
              ? "gray"
              : categoryColor,
          paddingVertical: 18,
          alignItems: "center",
        }}
        onPress={async () => {
          handleReservation();
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={{ color: "#fff" }}>CONFIRM RESERVATION</Text>
        )}
      </Pressable>
      {/*<FloatingButton bottomMargin={100} />*/}
    </SafeAreaView>
  );
};

export default PackageBooking;

const styles = StyleSheet.create({
  inputTitle: { fontSize: 12, fontWeight: "600", color: "#6B778C" },
  textInput: {
    borderWidth: 1,
    backgroundColor: "#FAFBFC",
    paddingHorizontal: 8,
    marginTop: 4,
    borderRadius: 3,
    borderColor: "#DFE1E6",
    paddingVertical: 6,
  },
  summarySubtitle: { fontSize: 14, fontWeight: "500", color: "#4A4A4A" },
  summaryContentText: { color: "#000", fontSize: 12, fontWeight: "400" },
});
