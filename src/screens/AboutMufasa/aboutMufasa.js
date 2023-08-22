import React, { useEffect } from "react";
import {
  Text,
  SafeAreaView,
  Pressable,
  View,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
  Linking,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import FloatingButton from "../../components/floatingButton";
import { trackScreen } from "../../controller/analytics";

const AboutMufasa = (props) => {
  const { navigation = () => null } = props;
  const bannerWidth = Dimensions.get("screen").width - 32;

  useEffect(() => {
    trackScreen("AboutMufasa");
  }, []);

  return (
    <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ marginBottom: 32 }}>
          <Pressable
            hitSlop={20}
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => {
              navigation?.goBack?.();
            }}
          >
            <FontAwesome5 name="angle-left" size={16} color="#5A0C1A" />
            <Text style={{ fontWeight: "600", color: "#000" }}>
              {"   "}About Mufasa
            </Text>
          </Pressable>
        </View>

        <ScrollView>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{ height: 60 }}
              source={require("../../../assets/images/new_logo.png")}
              resizeMode="contain"
            />
            <ImageBackground
              source={require("../../../assets/images/about_banner.png")}
              style={{
                width: bannerWidth,
                marginVertical: 20,
                height: bannerWidth / 2.1,
                borderRadius: 12,
                overflow: "hidden",
              }}
            />
          </View>

          <Text
            style={{ textAlign: "center", fontWeight: "500", color: "#E2C372" }}
          >
            <Text style={{ color: "#E2C372" }}>A single app</Text>, curated for
            Urban Luxury
          </Text>
          <Text style={{ color: "#000" }}>
            {"\n"}Consider us your “best” filter for services and things to do
            in the city.
            {"\n\n"}• No more shuffling through apps.
            {"\n"}• No more scrolling through review sites
            {"\n"}• No more wondering if ratings have been sponsore
            {"\n\n"}Our team does a deep dive into the city to find you the
            finest. We do the research and bring you exclusive app-only offers
            andd add-ons to enhance your experience as much as possible.
            {"\n\n"}Something not up to the mark? Let us know!
            {"\n"}To know more, visit us at{"\n\n"}
          </Text>
          <Pressable
            onPress={() => {
              Linking.openURL("https://www.mufasaglobal.com");
            }}
          >
            <Text style={{ fontWeight: "500", color: "#000" }}>
              www.mufasaglobal.com
            </Text>
          </Pressable>
        </ScrollView>
      </View>
      {/*<FloatingButton bottomMargin={80} />*/}
    </SafeAreaView>
  );
};

export default AboutMufasa;
