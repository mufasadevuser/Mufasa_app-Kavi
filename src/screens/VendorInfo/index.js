import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StarRating from "react-native-star-rating";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import { SquareLineDivider, Title, TitleQ } from "../../components";
import { Carousel } from "../../components/carousel";
import { addRating, toggleFavourite } from "../../controller/auth";
import { configs } from "../../values/config";

const OptionView = ({
  index,
  option,
  selectedOption,
  screenConfig,
  onPressOption,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPressOption(option, index)}
      style={{
        ...styles.optionContainer,
        borderWidth: option._id === selectedOption ? 2 : 1,
        backgroundColor: screenConfig.secColor,
      }}
    >
      <View style={styles.optionTitle}>
        <Text style={styles.optionTitleText}>{`PACKAGE ${index + 1}`}</Text>
        <Text style={styles.optionTitlePrice}>{option.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const VendorInfo = ({ route, navigation }) => {
  const { vendorData, serviceType, selectedCategory } = route.params;
  const screenConfig = configs.SCREEN_CONFIG[selectedCategory];

  const {
    _id,
    ratings,
    general_information,
    social_media,
    images,
    packages,
    favourite,
    avg_rating,
  } = vendorData;
  const [liked, setLiked] = useState(!_.isEmpty(favourite));
  const { twitter, facebook, instagram, website } = social_media ?? {};

  const [rating, setRating] = useState(ratings?.rating ?? avg_rating ?? 0);

  const postToggleFavourite = async () => {
    const auth = await AsyncStorage.getItem("@auth");
    const u = JSON.parse(auth);

    toggleFavourite(u.token, serviceType, _id);
    setLiked(!liked);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message:
          'Share "' +
          general_information.name +
          '" with your friends.\n' +
          `https://maps.google.com/?q=${general_information.name}`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const onPressOption = (option, index) => {
    navigation.navigate("PackageInfo", {
      vendorData,
      serviceType,
      selectedCategory,
      package: option,
      index,
    });
  };

  const onStarRatingPress = (rating) => {
    setRating(rating);
    addRating(serviceType, _id, rating);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View
        style={[styles.innerContainer, { backgroundColor: screenConfig.color }]}
      >
        <View
          style={[
            styles.headerContainer,
            { backgroundColor: screenConfig.color },
          ]}
        >
          {images?.length > 1 ? (
            <Carousel
              data={images}
              renderItem={({ index, item }) => (
                <View key={index} style={[styles.cardSlider]}>
                  <Image source={{ uri: item }} style={styles.cardImage} />
                </View>
              )}
              style={{ width: Dimensions.get("window").width - 34 }}
            />
          ) : (
            <Image
              source={require("../../../assets/images/logo.png")}
              style={{
                width: "100%",
                height: 250,
              }}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backIcon}
          >
            <FontAwesome5
              style={styles.icons}
              name="arrow-left"
              size={25}
              color="#FCDA80"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.heartIcon}
            onPress={postToggleFavourite}
          >
            <FontAwesome5
              style={styles.icons}
              name="heart"
              size={25}
              color={liked ? "#ff5a3d" : "#FCDA80"}
              solid={liked}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareIcon} onPress={() => onShare()}>
            <FontAwesome5
              style={styles.icons}
              name="share-alt"
              size={25}
              color="#FCDA80"
            />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.infoContainer}>
          <TitleQ
            text={general_information.name}
            color="#FCDA80"
            size={23}
            align="center"
          />
          <SquareLineDivider />
          <StarRating
            maxStars={5}
            rating={rating}
            fullStarColor="#FCDA80"
            starSize={22}
            selectedStar={onStarRatingPress}
            starStyle={{ marginRight: 4 }}
          />
          <Text style={styles.about}>{general_information.about}</Text>
          <View style={styles.row}>
            {!_.isEmpty(instagram) && (
              <TouchableOpacity
                style={styles.socialIcons}
                onPress={() => {
                  Linking.openURL(`${instagram}`);
                }}
              >
                <FontAwesome5
                  name="instagram"
                  size={30}
                  color={configs.COLORS.whitePrimary}
                />
              </TouchableOpacity>
            )}
            {!_.isEmpty(facebook) && (
              <TouchableOpacity
                style={styles.socialIcons}
                onPress={() => Linking.openURL(`${facebook}`)}
              >
                <FontAwesome5
                  name="facebook"
                  size={30}
                  color={configs.COLORS.whitePrimary}
                />
              </TouchableOpacity>
            )}
            {!_.isEmpty(twitter) && (
              <TouchableOpacity
                style={styles.socialIcons}
                onPress={() => Linking.openURL(`${twitter}`)}
              >
                <FontAwesome5
                  name="twitter"
                  size={30}
                  color={configs.COLORS.whitePrimary}
                />
              </TouchableOpacity>
            )}
            {!_.isEmpty(website) && (
              <TouchableOpacity
                style={styles.socialIcons}
                onPress={() => Linking.openURL(`${website}`)}
              >
                <FontAwesome5
                  name="link"
                  size={30}
                  color={configs.COLORS.whitePrimary}
                />
              </TouchableOpacity>
            )}
          </View>
          {packages?.length > 0 && (
            <>
              <View style={{ marginBottom: 6 }}>
                <Title text="Packages Available" color="#FCDA80" />
              </View>

              <View
                style={{
                  marginBottom: 12,
                }}
              >
                {packages.map((o, index) => (
                  <OptionView
                    key={index}
                    index={index}
                    option={o}
                    screenConfig={screenConfig}
                    onPressOption={onPressOption}
                  />
                ))}
              </View>
            </>
          )}
          <Image
            style={styles.logoIcon}
            source={require("../../../assets/images/icons/logoIcon.png")}
          />
          <View style={styles.otherLinks}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `https://wa.me/${general_information.contact_number}?text=Hey! We heard about you on Mufasa and would like to make a booking!`
                )
              }
              style={styles.linkButton}
            >
              <FontAwesome5 name="whatsapp" color="#FCDA80" size={25} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  general_information?.google_map_link ??
                    `https://maps.google.com/?q=${general_information?.name}`
                )
              }
              style={styles.linkButton}
            >
              <FontAwesome5 name="map-marker-alt" color="#FCDA80" size={25} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(`tel:${general_information.contact_number}`)
              }
              style={styles.linkButton}
            >
              <FontAwesome5 name="phone-alt" color="#FCDA80" size={25} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
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
  },
  headerContainer: {
    width: "100%",
    height: 250,
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
    width: Dimensions.get("screen").width - 40,
    paddingHorizontal: 14,
    paddingVertical: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  about: {
    textAlign: "justify",
    marginVertical: 10,
    color: configs.COLORS.whitePrimary,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontSize: 13,
  },
  logoIcon: {
    height: 70,
    resizeMode: "contain",
    opacity: 0.4,
    marginBottom: 20,
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
  modalMainContainer: {
    backgroundColor: "#000000B0",
    height: "100%",
    width: "100%",
  },
  reserveContainer: {
    width: Dimensions.get("window").width - 20,
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
  row: {
    width: Dimensions.get("window").width - 200,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 24,
  },
  socialIcons: {
    marginHorizontal: 10,
  },
  optionContainer: {
    width: Dimensions.get("window").width - 80,
    borderColor: "#FCDA80",
    borderStyle: "solid",
    marginVertical: 5,
    borderRadius: 10,
    alignItems: "center",
    padding: 10,
  },
  optionTitle: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  optionTitleText: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontSize: 14,
    color: "#FCDA80",
    marginBottom: 6,
  },
  optionTitlePrice: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    color: "#FCDA80",
    textTransform: "uppercase",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: "12%",
  },
  optionDescription: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    width: "100%",
    textAlign: "justify",
    color: "#fff",
    fontSize: 13,
  },
  webviewStyle: {
    width: Dimensions.get("window").width - 100,
    height: 70,
    backgroundColor: "#00000000",
    color: "#fff",
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
