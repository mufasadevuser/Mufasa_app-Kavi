import {
  CardField,
  createToken,
  useStripe,
  confirmPayment,
} from "@stripe/stripe-react-native";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StripePayment({ navigation, route }) {
  const { onPaymentSuccess, amount, currency } = route.params;
  const [cardData, setCardData] = useState(null);
  const getCardData = (data) => {
    setCardData(data?.complete);
  };

  const createPaymentIntent = async () => {
    const data = {
      amount: amount * 100,
      currency,
    };
    try {
      const response = await axios.post(
        "https://api.mufasa.ae:8000/api/initiateStripePayment",
        data
      );
      return response?.data; // Optionally return the response data if needed
    } catch (error) {
      alert(error);
    }
  };
  const cardDetailsButton = async () => {
    const sample = {
      amount: amount * 100,
      currency,
    };
    try {
      //api not working fine
      setCardData(false);
      const response = await createPaymentIntent(sample);
      console.log(response, "createPaymentIntent");
      if (response?.paymentIntent) {
        const paymentConfirm = await confirmPayment(response?.paymentIntent, {
          paymentMethodType: "Card",
        });
        onPaymentSuccess(paymentConfirm);

        console.log(paymentConfirm, "paymentConfirm");
      }
      console.log(response, "success1111");
    } catch (e) {
      alert(e);
    }
  };
  const goBack = () => {
    navigation.goBack("hi hello testing");
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          height: 40,
          justifyContent: "flex-start",
          padding: 10,
          marginTop: 10,
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Amount : </Text>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          {amount} {currency.toUpperCase()}
        </Text>
      </View>
      <View
        style={{
          width: "100%",
          height: 40,
          justifyContent: "flex-end",
          padding: 10,
          marginTop: 10,
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Please Enter Your Card Details :
        </Text>
      </View>
      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: "4242 4242 4242 4242",
        }}
        cardStyle={{
          backgroundColor: "#FFFFFF",
          textColor: "#000000",
          borderWidth: 1,
          borderColor: cardData ? "#5A0C1A" : "gray",
        }}
        style={{
          width: "100%",
          height: 50,
          marginVertical: 30,
        }}
        onCardChange={(cardDetails) => {
          getCardData(cardDetails);
        }}
        // onFocus={focusedField => {
        //     console.log('focusField', focusedField);
        // }}
      />
      <TouchableOpacity
        disabled={!cardData}
        activeOpacity={0.3}
        style={cardData ? styles.payButtonEnable : styles.payButtonDisable}
        onPress={cardDetailsButton}
      >
        <Text style={{ fontSize: 17, fontWeight: "bold", color: "white" }}>
          Pay
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  payButtonEnable: {
    width: "90%",
    height: 40,
    backgroundColor: "#5A0C1A",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  payButtonDisable: {
    width: "90%",
    height: 40,
    backgroundColor: "gray",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
});
