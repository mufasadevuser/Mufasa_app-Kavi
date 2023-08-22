import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import React, { useState } from "react";
import { Dimensions, Text, View } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";

import { Carousel } from "../components/carousel";
import { toggleFavourite } from "../controller/auth";
import { ImageWithLoader } from "./imageWithLoader";

const VendorCard = React.memo((props) => {
  const {
    vendorData,
    navigation = () => null,
    onPress = () => null,
    selectedCategory = {},
  } = props;
  const width = Dimensions.get("window").width - 32;

  // const [tags, setTags] = useState({});

  // const {
  //   club_tags = null,
  //   service_tags = null,
  //   activity_tags = null,
  //   restaurant_tags = null,
  // } = vendorData || {};

  // useEffect(() => {
  //   if (club_tags || service_tags || activity_tags || restaurant_tags) {
  //     const tagList =
  //       club_tags ?? service_tags ?? activity_tags ?? restaurant_tags;
  //     const tagsObject = {};
  //     _.forEach(tagList, item => {
  //       tagsObject[item] = true;
  //     });
  //     setTags(tagsObject);
  //   }
  // }, []);

  const {
    avg_rating = 5,
    general_information = {},
    images = [],
    favourite = false,
    _id = "",
    resource_type = "",
    packages,
  } = vendorData ?? {};

  const { name, address } = general_information ?? {};

  const tempData = [];
  for (let index = 0; index < packages.length; index++) {
    if (!_.isEmpty(packages[index].price)) {
      tempData.push(packages[index]);
    } else if (!_.isEmpty(packages[index].prices)) {
      const prices = packages[index].prices;
      const singleDay = prices.singleday;
      for (let j = 0; j < singleDay.length; j++) {
        const price = singleDay[j].price;
        if (!_.isEmpty(price)) {
          packages[index].price = price;
          tempData.push(packages[index]);
        }
      }
    }
  }

  const [liked, setLiked] = useState(!_.isEmpty(favourite));

  const postToggleFavourite = async () => {
    const auth = await AsyncStorage.getItem("@auth");
    const u = JSON.parse(auth);
    toggleFavourite(u.token, resource_type, _id);
    setLiked(!liked);
  };

  const categoryColor = selectedCategory?.categoryColor ?? "#000";

  return (
    <View
      style={{
        flex: 1,
        marginBottom: 24,
        borderRadius: 8,
        elevation: 4,
        backgroundColor: "#fff",
        shadowColor: "black",
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        overflow: "visible",
      }}
    >
      <Carousel
        data={images}
        renderItem={({ item }) => {
          // const uri = item.replace(
          //   'https://api.mufasa.ae:8000/',
          //   'https://dev.mufasa.ae:8080/',
          // );
          const uri = item.replace(
            "http://api.mufasaglobal.com:8000/",
            "https://api.mufasa.ae:8000/"
          );
          return (
            <Pressable
              onPress={() => {
                navigation?.navigate?.("VendorDetail", {
                  vendorData,
                  onFavouritePress: postToggleFavourite,
                  isLiked: liked,
                });
                onPress?.(true);
              }}
              style={{
                height: 180,
                width,
              }}
            >
              <ImageWithLoader
                source={{
                  uri,
                }}
                style={{
                  height: 200,
                  width,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                }}
                resizeMode="cover"
              />
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={() => {
          navigation?.navigate?.("VendorDetail", {
            vendorData,
            onFavouritePress: postToggleFavourite,
            isLiked: liked,
          });
          onPress?.(true);
        }}
        style={{
          paddingTop: 12,
          paddingBottom: 16,
          paddingHorizontal: 8,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {tempData.length > 0 ? (
          <View
            style={{
              flex: 1,
              marginRight: 12,
              alignItems: "baseline",
            }}
          >
            <View style={{ marginLeft: -6, paddingBottom: 5 }}>
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 14,
                  color: "#000",
                  backgroundColor: "#E0BF89",
                  borderRadius: 5,
                  marginLeft: 5,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  lineHeight: 18,
                }}
              >
                Featured
              </Text>
            </View>
            <Text
              style={{
                fontWeight: "600",
                fontSize: 16,
                color: categoryColor,
              }}
            >
              {name}
            </Text>
            <Text style={{ fontWeight: "500", fontSize: 12, marginTop: 8 }}>
              {address}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, marginRight: 12 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "flex-start",
                //overflow: '',
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 16,
                  color: categoryColor,
                }}
              >
                {name}
              </Text>
            </View>
            <Text style={{ fontWeight: "500", fontSize: 12, marginTop: 8 }}>
              {address}
            </Text>
          </View>
        )}
        {!_.isEmpty(images) && (
          <View
            style={{
              marginTop: 50,
              alignSelf: "center",
              backgroundColor: selectedCategory?.categoryColor ?? "#008000",
              borderRadius: 4,
              paddingHorizontal: 10,
              paddingVertical: 4,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* <Text style={{color: '#fff', marginTop: -1, marginRight: 2}}>
              {avg_rating ?? 5}
            </Text> */}
            <Text style={{ color: "#fff", marginTop: -1, marginRight: 2 }}>
              {5}
            </Text>
            <AntDesign name="star" size={10} color="gold" />
          </View>
        )}
      </Pressable>

      {/* heart */}
      <Pressable
        hitslop={12}
        onPress={postToggleFavourite}
        style={{
          backgroundColor: "#fff",
          position: "absolute",
          right: 8,
          top: 8,
          width: 24,
          height: 24,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesome5
          name="heart"
          size={14}
          color={liked ? "red" : "gray"}
          solid={liked}
        />
      </Pressable>
    </View>
  );
});

export { VendorCard };
