import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StripeProvider } from "@stripe/stripe-react-native";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, LogBox, Platform, View } from "react-native";
import appsFlyer from "react-native-appsflyer";
import codePush from "react-native-code-push";
import { checkNotifications } from "react-native-permissions";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Provider, useDispatch, useSelector } from "react-redux";
import { createStore } from "redux";

import { navigationRef } from "./RootNavigation";
import SideBarWhatsApp from "./src/components/sideBarWhatsApp";
import rootReducer from "./src/reducers";
import AboutMufasa from "./src/screens/AboutMufasa";
import Favourites from "./src/screens/Favourites";
import Home from "./src/screens/Home";
import NeedHelp from "./src/screens/NeedHelp";
import PackageBooking from "./src/screens/PackageBooking";
import StripePayment from "./src/screens/Payment/StripePayment";
import Reservations from "./src/screens/Reservations";
import UserLogin from "./src/screens/UserLogin";
import UserProfile from "./src/screens/UserProfile";
import UserSignUp from "./src/screens/UserSignUp";
import VendorDetail from "./src/screens/VendorDetail";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
};
const onInstallConversionDataCanceller = appsFlyer.onInstallConversionData(
  (res) => {
    if (JSON.parse(res?.data?.is_first_launch) == true) {
      if (res.data.af_status === "Non-organic") {
        const media_source = res.data.media_source;
        const campaign = res.data.campaign;
        console.log(
          "This is first launch and a Non-Organic install. Media source: " +
            media_source +
            " Campaign: " +
            campaign
        );
      } else if (res.data.af_status === "Organic") {
        console.log("This is first launch and a Organic Install");
      }
    } else {
      console.log("This is not first launch");
    }
  }
);

const onAppOpenAttributionCanceller = appsFlyer.onAppOpenAttribution((res) => {
  console.log(res);
});

appsFlyer.initSdk(
  {
    devKey: "LfcJfvDchULVyd5qXGUFS5",
    isDebug: true,
    appId: "1599042855",
  },
  (result) => {
    console.log(result);
  },
  (error) => {
    console.error(error);
  }
);

checkNotifications().then(({ status, settings }) => {
  // …
});

// Ignore log notification by message
LogBox.ignoreAllLogs();

const store = createStore(rootReducer);

const MainApp = () => (
  <NavigationContainer ref={navigationRef}>
    <NavigatorController />
  </NavigationContainer>
);

const App = () => {
  const [publishableKey, setPublishableKey] = useState("");
  useEffect(() => {
    try {
      const key =
        "pk_live_51KZ7RwGU3vjw5LcxtvlfqJqEXNTEMNFkBcqx2tYwcyvZBj0ZoqTErVIDWKpSOWvKbmqSmSBKL1Bnzm5KTjJw3C9E00p9q4O5kB";
      setPublishableKey(key);
    } catch (e) {
      console.log({
        error: {
          setPublishableKey: e,
        },
      });
    }
  }, []);

  return (
    <StripeProvider
      publishableKey="pk_live_51KZ7RwGU3vjw5LcxtvlfqJqEXNTEMNFkBcqx2tYwcyvZBj0ZoqTErVIDWKpSOWvKbmqSmSBKL1Bnzm5KTjJw3C9E00p9q4O5kB"
      // merchantIdentifier="merchant.identifier" // required for Apple Pay
      // urlScheme="mufasa"
    >
      <Provider store={store}>
        <MainApp />
      </Provider>
    </StripeProvider>
  );
};

export default __DEV__ ? App : codePush(codePushOptions)(App);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      backBehavior="initialRoute"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Favourites") {
            iconName = "heart";
          } else if (route.name === "Reservations") {
            iconName = "calendar-alt";
          }
          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarInactiveTintColor: "gray",

        tabBarActiveTintColor: "#EBB909",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Favourites" component={Favourites} />
      <Tab.Screen name="Reservations" component={Reservations} />
    </Tab.Navigator>
  );
};

const LoginNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserLogin" component={UserLogin} />
    </Stack.Navigator>
  );
};

const AuthorisedNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabScreen" component={TabNavigator} />
      <Stack.Screen name="VendorDetail" component={VendorDetail} />
      <Stack.Screen name="PackageBooking" component={PackageBooking} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Reservations" component={Reservations} />
      <Stack.Screen name="AboutMufasa" component={AboutMufasa} />
      <Stack.Screen name="NeedHelp" component={NeedHelp} />
      <Stack.Screen
        options={{ headerShown: true, headerTitle: "Payment" }}
        name="StripePayment"
        component={StripePayment}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = ({ isExistingUser }) => {
  return (
    <Drawer.Navigator
      initialRouteName={isExistingUser ? "App" : "SignUp"}
      backBehavior="none"
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
      }}
    >
      <Drawer.Screen name="SignUp" component={UserSignUp} />
      {/* <Drawer.Screen name="AppIntro" component={AppIntro} /> */}
      <Drawer.Screen name="App" component={AuthorisedNavigator} />
    </Drawer.Navigator>
  );
};

const NavigatorController = () => {
  // hooks
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const userAuthData = state.userAuth;

  // states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  // effects
  useEffect(() => {
    setIsLoading(true);
    AsyncStorage.multiGet(["@auth", "@city", "@firstTime"])
      .then((items) => {
        const user = items[0][1];
        const loginData = JSON.parse(user);

        const city = items[1][1];
        dispatch({
          type: "CITY",
          payload: {
            selectedCity: city ?? "Goa",
          },
        });

        // const firstTimeUser = items[2][1];
        if (loginData?.user?.displayName) {
          setIsExistingUser(true);
        }

        if (
          (!_.isEmpty(loginData?.token) ||
            !_.isEmpty(loginData?.user?.userId)) &&
          loginData?.user?.userType === "customer"
        ) {
          setIsLoggedIn(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isLoggedIn]);

  useEffect(() => {
    setIsLoggedIn(userAuthData?.isLoggedIn);
  }, [userAuthData?.isLoggedIn]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === "android" ? (isLoggedIn ? 8 : 0) : 0,
        backgroundColor: "#fff",
      }}
    >
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : isLoggedIn ? (
        <>
          <View style={{ flex: 1 }} onTouchStart={() => setShowPopup(false)}>
            <AppNavigator isExistingUser={isExistingUser} />
          </View>
          <SideBarWhatsApp
            showPopup={showPopup}
            setShowPopup={(value) => setShowPopup(value)}
          />
        </>
      ) : (
        <LoginNavigator />
      )}
    </View>
  );
};
