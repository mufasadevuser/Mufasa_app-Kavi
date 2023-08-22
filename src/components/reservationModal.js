import AsyncStorage from "@react-native-async-storage/async-storage";
import analytics from "@react-native-firebase/analytics";
import { useNavigation } from "@react-navigation/native";
// import { useStripe, usePaymentSheet } from "@stripe/stripe-react-native";
import axios from "axios";
import _ from "lodash";
import { default as React, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-simple-toast";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import { InputNumber, InputText, Submit, TitleQ } from "../components";
import { trackEventNormal } from "../controller/analytics";
import { bookActivity } from "../controller/experience";
import {
  bookClub,
  bookEvent,
  bookResto,
  bookService,
} from "../controller/exquisite";
import { getCurrentUser, handleApiFail } from "../helpers/authHelper";
import { makePayment } from "../screens/Payment";
import { configs } from "../values/config";

// const stripeUrl = `https://api.mufasa.ae:8000/api/payment/stage/stripe`;

const getTimeSlots = () => {
  const timeslots = [];
  const slots = [
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
    "10:00 PM",
    "11:00 PM",
    "12:00 AM",
    "01:00 AM",
    "02:00 AM",
  ];
  for (let i = 0; i < 15; i++) {
    const item = {
      label: slots[i],
      value: slots[i],
    };
    timeslots.push(item);
  }
  return timeslots;
};

// const fetchPaymentSheetParams = async (price) => {
//   const user = await getCurrentUser();
//
//   const response = await axios
//     .post(
//       stripeUrl,
//       {
//         amount: price,
//         currency: "aed",
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${user?.token}`,
//         },
//       }
//     )
//     .catch(handleApiFail);
//
//   const { paymentIntent, ephemeralKey, customer } = response?.data ?? {};
//
//   return {
//     paymentIntent,
//     ephemeralKey,
//     customer,
//   };
// };

const initiatePayment = async ({
  resource_id,
  resource_type,
  package_id,
  payment_gateway,
}) => {
  const user = await getCurrentUser();

  const response = await axios
    .post(
      "https://api.mufasa.ae:8000/api/payment/stage/initiate",
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

export const ReservationModal = ({
  vendorData,
  visible,
  setVisible,
  selectedOpt,
  serviceType,
  time,
  date,
}) => {
  // state
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const navigation = useNavigation();
  const [selectedCity, setSectedCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSheetParams, setPaymentSheetParams] = useState({});
  const [guestContactWithCountry, setGuestContactWithCountry] = useState("");

  const rawPrice =
    selectedOpt?.price || selectedOpt?.prices?.singleday?.[0]?.price;

  let price = rawPrice?.replace(/\D/g, "");
  price = parseInt(price, 10);

  useEffect(() => {
    if (selectedCity === "Goa") {
      let contactWithCountry = guestContact;
      if (!_.includes(contactWithCountry, "+91")) {
        contactWithCountry = "+91" + contactWithCountry;
      }
      setGuestContactWithCountry(contactWithCountry);
    }
  }, [guestContact]);

  // hooks
  // const { initPaymentSheet } = useStripe();
  // const { loading: paymentSheetLoading, presentPaymentSheet } =
  //   usePaymentSheet();

  // variables
  const resource_id = vendorData?._id;
  const package_id = selectedOpt?._id;
  // const payment_gateway = selectedCity === "Goa" ? "Razorpay" : "Stripe";

  useEffect(() => {
    if (selectedCity === "Dubai") {
      // initializeStripePaymentSheet({
      //   resource_id,
      //   resource_type: serviceType,
      //   package_id,
      //   payment_gateway,
      // });
    }
  }, [selectedCity]);

  useEffect(() => {
    AsyncStorage.getItem("@city").then((city) => {
      setSectedCity(city);
      if (selectedCity !== "Dubai") {
        setIsLoading(false);
      }
    });
  }, []);

  // stripe methods
  // const initializeStripePaymentSheet = async ({
  //   resource_id,
  //   resource_type,
  //   package_id,
  //   payment_gateway,
  // }) => {
  //   setIsLoading(true);
  //
  //   if (_.isNaN(price) || _.isNull(price) || _.isUndefined(price)) {
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
  //       Toast("Payment initilisation failed.");
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

  const { _id: id } = vendorData;

  const isClub = serviceType === configs.VENDOR_TYPES.CLUB;
  const isEvent = serviceType === configs.VENDOR_TYPES.EVENT;

  const handlePayment = async ({ u, payment_user }) => {
    if (_.isNaN(price) || _.isNull(price) || _.isUndefined(price)) {
      return {
        id,
        guestName,
        guestContact: guestContactWithCountry,
        guestCount,
        specialRequest,
        date,
        time,
        option: selectedOpt,
      };
    }

    if (selectedCity === "Dubai") {
      // stripe
      const isSuccessful = await openPaymentSheet();
      if (!isSuccessful) {
        throw "payment-failed";
      } else {
        const booking = {
          id,
          guestName,
          guestContact: guestContactWithCountry,
          date,
          time,
          guestCount,
          specialRequest,
          option: selectedOpt,
          payment: {
            payment_id: paymentSheetParams?.paymentIntent,
            payment_gateway: "stripe",
          },
        };
        return booking;
      }
    } else if (selectedCity === "Goa") {
      // razorpay
      const data = await initiatePayment({
        resource_id,
        resource_type: serviceType,
        package_id,
        payment_gateway,
      });
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
        id,
        guestName,
        guestContact: guestContactWithCountry,
        guestCount,
        specialRequest,
        date,
        time,
        option: selectedOpt,
        payment: {
          payment_id: razorpayPaymentId,
          payment_gateway: "razorpay",
        },
      };
      return booking;
    }
  };

  //handle Reservation
  const handleReservation = async () => {
    await trackEventNormal("Package_Reservation_page_Confirm");
    if (
      (isClub && !(guestName && guestContact && date && time)) ||
      (isEvent && !(guestName && guestCount && date))
    ) {
      Toast.show("Please provide the required details");
      return;
    }

    const user = await AsyncStorage.getItem("@auth");
    const u = JSON.parse(user);

    try {
      const payment_user = {
        contact: guestContactWithCountry,
        displayName: guestName,
      };

      switch (serviceType) {
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

      setVisible(false);

      setTimeout(() => {
        navigation?.goBack?.();
      }, 250);

      setTimeout(async () => {
        Toast.show("Booking Successful");
        navigation.navigate("Bookings");
      }, 1000);
    } catch (err) {
      Toast.show("Booking Unsuccessful");
    } finally {
      await AsyncStorage.removeItem("@payment");
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(!visible)}
      transparent
      animationType="slide"
      style={{ width: "100%", height: "100%" }}
    >
      <View style={styles.modalMainContainer}>
        <View style={styles.reserveContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setVisible(!visible)}
          >
            <FontAwesome5
              style={styles.icons}
              name="times"
              size={20}
              color="#1B342F"
            />
          </TouchableOpacity>
          <TitleQ text="Reservation" size={25} color="#FCDA80" />
          <InputText
            value={guestName}
            setValue={setGuestName}
            label="Guest Name*"
          />
          {!isClub && (
            <InputNumber
              value={guestCount}
              setValue={setGuestCount}
              label="No. of Guests*"
            />
          )}
          {isClub && (
            <InputNumber
              value={guestContact}
              setValue={setGuestContact}
              label="Contact Number*"
              maxLength={10}
            />
          )}
          {!isClub && !isEvent && (
            <InputText
              value={specialRequest}
              setValue={setSpecialRequest}
              label="Any Special Request?"
            />
          )}
          {isLoading ? (
            <ActivityIndicator color="#FCDA80" size="large" />
          ) : (
            <Submit
              handleSubmit={handleReservation}
              label={isClub ? "Continue to Payment" : "Confirm Reservation"}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#161A46",
  },
  innerContainer: {
    width: Dimensions.get("window").width - 30,
    height:
      Dimensions.get("window").height - (Platform.OS === "ios" ? 100 : 50),
    borderColor: "#FCDA80",
    borderWidth: 2,
    borderRadius: 20,
    margin: 15,
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#00000050",
  },
  headerContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#161A46",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
    shadowRadius: 10,
    shadowOpacity: 1,
    justifyContent: "space-between",
  },
  wrapper: {
    backgroundColor: "#00000000",
    height: 250,
  },
  cardSlider: {
    width: Dimensions.get("window").width - 34,
    height: 250,
    backgroundColor: "#00000000",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  controlsContainer: {
    width: "100%",
    height: 250,
    position: "absolute",
  },
  backIcon: {
    top: 10,
    left: 10,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  heartIcon: {
    right: 10,
    top: 10,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  shareIcon: {
    right: 10,
    top: 60,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  icons: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 7,
  },
  infoContainer: {
    width: Dimensions.get("window").width - 40,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  about: {
    textAlign: "center",
    marginVertical: 10,
    color: configs.COLORS.whitePrimary,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontSize: 13,
  },
  logoIcon: {
    height: 70,
    resizeMode: "contain",
    opacity: 0.4,
    marginVertical: 20,
  },
  submitContainer: {
    width: Dimensions.get("window").width - 74,
  },
  otherLinks: {
    width: Dimensions.get("window").width - 74,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  linkButton: {
    height: 50,
    width: (Dimensions.get("window").width - 74) / 3 - 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#FCDA80",
    borderWidth: 1,
    borderRadius: 5,
  },
  reserveContainer: {
    width: Dimensions.get("window").width - 10,
    alignSelf: "center",
    backgroundColor: "#1B342F",
    position: "absolute",
    bottom: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: "#FCDA80",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  dateContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateSquareLineSquare: {
    width: 7,
    height: 7,
    transform: [{ rotate: "45deg" }],
    borderColor: "#FCDA80D0",
    borderWidth: 0.8,
    top: 10,
  },
  closeBtn: {
    position: "absolute",
  },
  modalMainContainer: {
    backgroundColor: "#000000B0",
    height: "100%",
    width: "100%",
  },
  modalClose: {
    backgroundColor: "#FCDA80",
    width: 45,
    height: 45,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: -50,
    bottom: 25,
  },
});
