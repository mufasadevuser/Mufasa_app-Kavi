import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";

import Home from "../screens/Home";
import OnBoard from "../screens/OnBoarding";
import { PackageInfo } from "../screens/Packages";
import About from "../screens/User/About";
import Bookings from "../screens/User/Bookings";
import { Favourites } from "../screens/User/Favourites";
import Login from "../screens/User/Login";
import Profile from "../screens/User/Profile";
import { VendorInfo } from "../screens/VendorInfo";
import { VendorListing } from "../screens/VendorListing";
import { DrawerScreen } from "./Drawer";

//drawer navigation
const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerScreen {...props} />}
      screenOptions={{
        drawerStyle: { backgroundColor: "#00000000" },
        headerTintColor: "black",
        gestureEnabled: true,
        animation: "slide_from_right",
        presentation: "modal",
        // statusBarStyle: 'light',
        statusBarAnimation: "slide",
        swipeEnabled: false,
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="StackRouter"
        component={Router}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
};

//navigation configs
const Stack = createNativeStackNavigator();

const Router = () => {
  const userAuth = useSelector((state) => state.userAuth);

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("@auth")
      .then((userAuthData) => {
        const userData = JSON.parse(userAuthData);
        if (!_.isEmpty(userData?.token && !_.isEmpty(userData?.user?._id))) {
          setIsLoggedIn(true);
        }
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  /** If not logged in, show a splash or loading screen */
  if (isLoadingAuth) {
    return <View style={{ flex: 1, backgroundColor: "red" }} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: "black",
        gestureEnabled: false,
        animation: "slide_from_right",
        // presentation: 'modal',
        statusBarStyle: "light",
        statusBarAnimation: "slide",
      }}
    >
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OnBoard"
        component={OnBoard}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        initialParams={{ showCitySelection: true }}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VendorListing"
        component={VendorListing}
        options={{
          headerShown: false,
          statusBarStyle: "dark",
        }}
      />
      <Stack.Screen
        name="VendorInfo"
        component={VendorInfo}
        options={{
          headerShown: false,
          statusBarStyle: "dark",
        }}
      />
      <Stack.Screen
        name="PackageInfo"
        component={PackageInfo}
        options={{
          headerShown: false,
          statusBarStyle: "dark",
        }}
      />
      <Stack.Screen
        name="Bookings"
        component={Bookings}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="About"
        component={About}
        options={{
          headerShown: false,
          statusBarStyle: "dark",
        }}
      />
      <Stack.Screen
        name="Favourites"
        component={Favourites}
        options={{
          headerShown: false,
        }}
      />
      {/* {false ? (
        <>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="OnBoard"
            component={OnBoard}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Home"
            component={Home}
            initialParams={{showCitySelection: true}}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="VendorListing"
            component={VendorListing}
            options={{
              headerShown: false,
              statusBarStyle: 'dark',
            }}
          />
          <Stack.Screen
            name="VendorInfo"
            component={VendorInfo}
            options={{
              headerShown: false,
              statusBarStyle: 'dark',
            }}
          />
          <Stack.Screen
            name="PackageInfo"
            component={PackageInfo}
            options={{
              headerShown: false,
              statusBarStyle: 'dark',
            }}
          />
          <Stack.Screen
            name="Bookings"
            component={Bookings}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="About"
            component={About}
            options={{
              headerShown: false,
              statusBarStyle: 'dark',
            }}
          />
          <Stack.Screen
            name="Favourites"
            component={Favourites}
            options={{
              headerShown: false,
            }}
          />
        </>
      )} */}
    </Stack.Navigator>
  );
};
