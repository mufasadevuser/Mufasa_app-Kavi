import AsyncStorage from "@react-native-async-storage/async-storage";
import analytics from "@react-native-firebase/analytics";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import {
  Text,
  SafeAreaView,
  Pressable,
  View,
  ScrollView,
  Linking,
  StyleSheet,
  Modal,
  Dimensions,
  Image,
  Share,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { Carousel } from "../../components/carousel";
import FloatingButton from "../../components/floatingButton";
import { ImageWithLoader } from "../../components/imageWithLoader";
import {
  trackEventNormal,
  trackEventNormalWithParams,
  trackScreen,
} from "../../controller/analytics";
import { configs } from "../../values/config";

const VendorDetail = (props) => {
  const { navigation = () => null, route = {} } = props;
  const { params = {} } = route;
  const { vendorData, onFavouritePress, isLiked } = params;

  const {
    avg_rating = 0,
    general_information = {},
    social_media = {},
    favourite = null,
    resource_type = "",
    _id = "",
    packages,
    images = [],
  } = vendorData;

  const {
    about = null,
    address = null,
    contact_number = null,
    alt_contact_number = null,
    email_address = null,
    name = null,
    location = null,
  } = general_information;

  const width = Dimensions.get("window").width - 32;

  // To Fetch packages With price and push it into an array of objects
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

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [liked, setLiked] = useState(isLiked);
  const [viewDetailPackage, setViewDetailPackage] = useState(null);
  const [category, setCategory] = useState("EXQUISITE");

  useEffect(() => {
    trackEventNormalWithParams(eventName, {
      id: vendorData._id,
      item: name,
    });
    trackScreen("VendorDetail");
  }, []);

  useEffect(() => {
    switch (resource_type.toLowerCase()) {
      case "club":
      case "restaurant": {
        setCategory("EXQUISITE");
        break;
      }
      case "activity": {
        setCategory("EXPERIENCE");
        break;
      }
      case "service": {
        setCategory("SERVICE");
        break;
      }
    }
  }, [resource_type]);

  const postToggleFavourite = async () => {
    // const auth = await AsyncStorage.getItem('@auth');
    // const u = JSON.parse(auth);
    // toggleFavourite(u.token, resource_type, _id);
    setLiked(!liked);
    onFavouritePress();
  };

  const categoryColor =
    configs?.SCREEN_CONFIG?.[category?.toUpperCase()]?.categoryColor;

  let eventName = "Vendor_" + name.replace(/[^a-zA-Z ]/g, "");
  eventName = eventName.replaceAll(" ", "_");
  if (eventName.length > 40) {
    eventName = eventName.substring(0, 40).replaceAll(" ", "_");
  }
  const onShare = async () => {
    console.log(vendorData);
    try {
      const result = await Share.share({
        message:
          vendorData?.general_information?.name +
          "\n" +
          vendorData?.general_information?.about +
          "\n" +
          vendorData?.general_information?.address +
          "\n" +
          vendorData?.general_information?.google_map_link +
          "\n" +
          "iOS App : https://apps.apple.com/tt/app/mufasa/id1599042855 " +
          "\n" +
          "Android App : https://play.google.com/store/apps/details?id=com.mufasaapp",
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        <Pressable
          hitSlop={20}
          onPress={() => {
            navigation?.goBack?.();
          }}
        >
          <FontAwesome5 name="angle-left" size={16} color="#000" />
        </Pressable>

        <View style={{ flexDirection: "row" }}>
          <Pressable hitSlop={12} onPress={postToggleFavourite}>
            <FontAwesome5
              name="heart"
              size={16}
              color={categoryColor ?? "rgba(0, 128, 0, 1)"}
              solid={liked}
            />
          </Pressable>
          <Pressable
            style={{ marginLeft: 18 }}
            hitSlop={12}
            onPress={async () => {
              await onShare();
            }}
          >
            <FontAwesome5
              name="share-alt"
              size={16}
              color={categoryColor ?? "rgba(0, 128, 0, 1)"}
            />
          </Pressable>
        </View>
      </View>
      {/* title */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          alignItems: "center",
        }}
      >
        <View style={{ marginVertical: 24, flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "600", color: "#000" }}>
            {name}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#4A4A4A" }}>
            {location}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: categoryColor ?? "rgba(0, 128, 0, 1)",
            paddingHorizontal: 12,
            paddingVertical: 2,
            borderRadius: 4,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* <Text style={{color: '#fff'}}>{avg_rating ?? 5} </Text> */}
          <Text style={{ color: "#fff" }}>{5} </Text>
          <AntDesign name="star" size={10} color="gold" />
        </View>
      </View>
      {/* options */}
      {tempData.length > 0 ? (
        <View
          style={{
            flexDirection: "row",
            marginBottom: 24,
            paddingHorizontal: 16,
          }}
        >
          <Pressable
            style={[styles.buttons, styles.shadow]}
            onPress={() => {
              const url =
                general_information?.google_map_link ??
                `https://maps.google.com/?q=${general_information?.name}` ??
                "";
              if (!_.isEmpty(url)) {
                Linking.openURL(url);
              }
            }}
          >
            <MaterialIcons
              name="location-pin"
              size={20}
              color={categoryColor}
            />
            <Text style={{ fontSize: 16, color: "#000" }}> Location</Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            marginBottom: 24,
            paddingHorizontal: 16,
          }}
        >
          <Pressable
            style={[styles.buttons, styles.shadow]}
            onPress={() =>
              Linking.openURL(`tel:${general_information.contact_number}`)
            }
          >
            <MaterialIcons name="phone" size={18} color={categoryColor} />
            <Text style={{ fontSize: 16, color: "#000" }}>{"  "}Call</Text>
          </Pressable>
          <Pressable
            style={[styles.buttons, styles.shadow]}
            onPress={() => {
              Linking.openURL(
                `https://wa.me/${general_information.contact_number}?text=Hey! We heard about you on Mufasa and would like to make a booking!`
              );
            }}
          >
            <FontAwesome5 name="whatsapp" size={18} color={categoryColor} />
            <Text style={{ fontSize: 16, color: "#000" }}>{"  "}Whatsapp</Text>
          </Pressable>
          <Pressable
            style={[styles.buttons, styles.shadow]}
            onPress={() => {
              const url =
                general_information?.google_map_link ??
                `https://maps.google.com/?q=${general_information?.name}` ??
                "";
              if (!_.isEmpty(url)) {
                Linking.openURL(url);
              }
            }}
          >
            <MaterialIcons
              name="location-pin"
              size={20}
              color={categoryColor}
            />
            <Text style={{ fontSize: 16, color: "#000" }}> Location</Text>
          </Pressable>
        </View>
      )}
      <ScrollView style={{ flex: 1 }} contentInset={{ bottom: 48 }}>
        <View style={{ paddingHorizontal: 16 }}>
          {/* images  */}
          <Carousel
            data={images}
            style={{ marginBottom: 20 }}
            renderItem={(renderData) => {
              return (
                <ImageWithLoader
                  source={{
                    uri: renderData?.item.replace(
                      "http://api.mufasaglobal.com:8000/",
                      "https://api.mufasa.ae:8000/"
                    ),
                  }}
                  style={{
                    height: 200,
                    width,
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
              );
            }}
          />
          {/* about */}
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 8,
                color: categoryColor,
              }}
            >
              About the {resource_type.toLowerCase()}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "400",
                marginBottom: 24,
                color: "#000",
              }}
            >
              {about}
            </Text>

            <View style={{ paddingHorizontal: 24, marginVertical: 12 }}>
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                <View
                  style={{
                    alignItems: "center",
                    paddingHorizontal: 3,
                  }}
                >
                  <FontAwesome5
                    name="map-pin"
                    size={16}
                    color={categoryColor}
                  />
                </View>
                <Text style={{ marginLeft: 12, color: "#000" }}>{address}</Text>
              </View>
              {packages.length > 0
                ? null
                : !_.isEmpty(email_address) && (
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={{
                          alignItems: "center",
                          paddingHorizontal: 0,
                        }}
                      >
                        <FontAwesome5
                          name="envelope"
                          size={16}
                          color={categoryColor}
                        />
                      </View>
                      <Text style={{ marginLeft: 12, color: "#000" }}>
                        {email_address}
                      </Text>
                    </View>
                  )}
            </View>
          </View>
        </View>

        {/* packages */}
        {!_.isEmpty(tempData) && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 16,
              paddingHorizontal: 16,
              color: categoryColor,
              marginTop: 24,
            }}
          >
            Packages
          </Text>
        )}
        {_.map(tempData, (item, index) => {
          const isSelected = selectedPackage?.index === index;
          console.log(item.price);
          return _.isEmpty(tempData) ? null : _.isEmpty(item.price) ? null : (
            <View style={{ paddingHorizontal: 16 }}>
              <Pressable
                onPress={async () => {
                  if (isSelected) {
                    setSelectedPackage(null);
                  } else {
                    let eventName = name.replace(/[^a-zA-Z ]/g, "");
                    eventName = eventName.replaceAll(" ", "_");
                    if (eventName.length > 21) {
                      eventName = eventName
                        .substring(0, 20)
                        .replaceAll(" ", "_");
                    }
                    eventName = "Vendor_page_" + eventName + "_package";
                    await trackEventNormalWithParams(eventName, {
                      id: item?._id,
                      item: item?.title,
                    });
                    await trackEventNormal("Vendor_page_package_All_packages");
                    setSelectedPackage({
                      ...item,
                      index,
                    });
                  }
                }}
                key={item?._id}
                style={[
                  {
                    padding: 10,
                    backgroundColor: "#fff",
                    marginBottom: 16,
                    borderRadius: 8,
                    borderColor: isSelected ? categoryColor : "transparent",
                    borderWidth: 1,
                  },
                  styles.shadow,
                  { shadowColor: isSelected ? categoryColor : "#000" },
                ]}
              >
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1, marginRight: 12, marginBottom: 12 }}>
                    <Text style={styles.packageTitle}>PACKAGE {index + 1}</Text>
                    <Text
                      style={[styles.packageContent, { color: categoryColor }]}
                    >
                      {item?.title}
                    </Text>
                  </View>
                  {_.isEmpty(item.price) ? null : (
                    <View>
                      <Text style={styles.packageTitle}>PRICE</Text>
                      <Text style={styles.packageContent}>{item?.price}</Text>
                    </View>
                  )}
                </View>
                {/* {!_.isEmpty(item.package_details) ? (
                  <>
                    <Text style={styles.packageTitle}>OTHER DETAILS</Text>
                    <Text
                      numberOfLines={1}
                      style={{fontWeight: '400', fontSize: 14, color: '#000'}}>
                      {item?.package_details?.join?.(' ')}
                    </Text>
                  </>
                ) : null} */}
                {!_.isEmpty(item.package_details) ? (
                  <Pressable
                    style={{ alignSelf: "center" }}
                    onPress={() => {
                      setViewDetailPackage(item);
                    }}
                  >
                    <Text
                      style={{
                        marginTop: 12,
                        textAlign: "center",
                        color: categoryColor,
                      }}
                    >
                      View Details{"  "}
                      <FontAwesome5
                        name="exclamation-circle"
                        size={12}
                        color={categoryColor}
                      />
                    </Text>
                  </Pressable>
                ) : null}
              </Pressable>
            </View>
          );
        })}

        {/* social media */}
        {tempData.length > 0
          ? null
          : (!_.isEmpty(social_media?.website) ||
              !_.isEmpty(social_media?.facebook) ||
              !_.isEmpty(social_media?.instagram)) && (
              <View style={{ paddingHorizontal: 16, marginVertical: 24 }}>
                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  {!_.isEmpty(social_media?.website) && (
                    <Pressable
                      hitSlop={12}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 20,
                      }}
                      onPress={() => {
                        Linking.openURL(social_media?.website);
                      }}
                    >
                      <FontAwesome5
                        name="external-link-alt"
                        size={16}
                        color={categoryColor}
                      />
                      <Text style={{ marginLeft: 4, color: "#000" }}>
                        Website
                      </Text>
                    </Pressable>
                  )}
                  {!_.isEmpty(social_media?.facebook) && (
                    <Pressable
                      hitSlop={12}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 20,
                      }}
                      onPress={() => {
                        Linking.openURL(social_media?.facebook);
                      }}
                    >
                      <FontAwesome5
                        name="facebook"
                        size={18}
                        color={categoryColor}
                      />
                      <Text style={{ marginLeft: 4, color: "#000" }}>
                        Facebook
                      </Text>
                    </Pressable>
                  )}
                  {!_.isEmpty(social_media?.instagram) && (
                    <Pressable
                      hitSlop={12}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        Linking.openURL(social_media?.instagram);
                      }}
                    >
                      <FontAwesome5
                        name="instagram"
                        size={18}
                        color={categoryColor}
                      />
                      <Text style={{ marginLeft: 4, color: "#000" }}>
                        Instagram
                      </Text>
                    </Pressable>
                  )}
                </View>
                <Text style={{ color: "rgba(74, 74, 74, 0.6)" }}>
                  Please note the website and social media links would open in
                  an external browser/app
                </Text>
              </View>
            )}
      </ScrollView>
      {!_.isEmpty(tempData) && (
        <Pressable
          disabled={_.isNull(selectedPackage)}
          style={{
            backgroundColor: !_.isNull(selectedPackage)
              ? categoryColor
              : "#4A4A4A",
            paddingVertical: 18,
            alignItems: "center",
          }}
          onPress={async () => {
            const city = await AsyncStorage.getItem("@city");
            if (
              city === null ||
              city === "Goa" ||
              city === "Dubai" ||
              city === "Thailand"
            ) {
              navigation?.push?.("PackageBooking", {
                packageDetails: selectedPackage,
                vendorData: vendorData ?? {},
                categoryColor,
              });
            }
          }}
        >
          <Text style={{ color: "#fff" }}>SELECT PACKAGE</Text>
        </Pressable>
      )}
      <Modal
        visible={!_.isNull(viewDetailPackage)}
        onRequestClose={() => setViewDetailPackage(null)}
        presentationStyle="formSheet"
        animationType="slide"
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "#fff",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 25,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: categoryColor,
              }}
            >
              Package Details
            </Text>
            <Pressable
              hitSlop={20}
              onPress={() => {
                setViewDetailPackage(null);
              }}
            >
              <FontAwesome5
                name="times"
                size={16}
                color="#000"
                style={{ marginRight: 12 }}
                brand
              />
            </Pressable>
          </View>
          <ScrollView style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 18 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: categoryColor,
                }}
              >
                Package Name
              </Text>
              <Text
                style={{ fontSize: 16, fontWeight: "500", color: "#4A4A4A" }}
              >
                {viewDetailPackage?.title}
              </Text>
              {_.isEmpty(viewDetailPackage?.price) ? null : (
                <>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      marginTop: 24,
                      color: categoryColor,
                    }}
                  >
                    Package Price
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "500",
                      color: "#4A4A4A",
                    }}
                  >
                    {viewDetailPackage?.price}
                  </Text>
                </>
              )}
              {_.isEmpty(viewDetailPackage?.package_details) ? null : (
                <>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      marginTop: 24,
                      color: categoryColor,
                    }}
                  >
                    Other Details
                  </Text>
                  <Text
                    style={{ fontSize: 14, marginBottom: 30, color: "#4A4A4A" }}
                  >
                    {viewDetailPackage?.package_details?.join("\n")}
                  </Text>
                </>
              )}
              <View
                style={{ justifyContent: "flex-end", alignItems: "center" }}
              >
                <Image
                  style={{ height: 80, marginBottom: 16 }}
                  source={require("../../../assets/images/new_logo.png")}
                  resizeMode="contain"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
       {/*<FloatingButton bottomMargin={100} />*/}
    </SafeAreaView>
  );
};

export default VendorDetail;

const styles = StyleSheet.create({
  shadow: {
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  packageTitle: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "400",
    color: "#4A4A4A",
  },
  packageContent: { fontSize: 16, fontWeight: "500", color: "#000" },
  buttons: {
    marginRight: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: "row",
  },
});
