import CheckBox from "@react-native-community/checkbox";
import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Linking,
} from "react-native";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import VersionCheck from "react-native-version-check";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { useSelector } from "react-redux";

import FloatingButton from "../../components/floatingButton";
import { LocationPicker } from "../../components/locationPicker";
import UserAvatar from "../../components/userAvatar";
import { VendorCard } from "../../components/vendorCard";
import { trackEventNormal, trackScreen } from "../../controller/analytics";
import { getActivities } from "../../controller/experience";
import { getClubs, getRestos } from "../../controller/exquisite";
import { getDashboardParams } from "../../controller/general";
import { getServices } from "../../controller/service";
import { configs } from "../../values/config";

const bannerImages = {
  Goa: {
    Experiences: "https://vendor.mufasa.ae/banners/Goa-Experiences.jpg",
    Exquisites: "https://vendor.mufasa.ae/banners/Goa-Exquisites.jpg",
    Ease: "https://vendor.mufasa.ae/banners/Goa-Ease.jpg",
  },
  Dubai: {
    Exquisites: "https://vendor.mufasa.ae/banners/Dubai-Exquisites.jpg",
    Experiences: "https://vendor.mufasa.ae/banners/Dubai-Experiences.jpg",
    Ease: "https://vendor.mufasa.ae/banners/Dubai-Ease.jpg",
  },
  Thailand: {
    Exquisites: "https://vendor.mufasa.ae/banners/Thailand-Exquisite.jpg",
    Experiences: "https://vendor.mufasa.ae/banners/Thailand-Experience.jpg",
    Ease: "https://vendor.mufasa.ae/banners/Thailand-Ease.jpg",
  },
};

const Home = (props) => {
  const { navigation } = props;

  //hooks
  const selectedCity = useSelector((state) => state.city.selectedCity);
  const isFocused = navigation.isFocused();

  // states
  const [selectedCategory, setSelectedCategory] = useState(
    configs.SCREEN_CONFIG.EXQUISITE
  );
  // const [showCategorySelector, setShowCategorySelector] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState(
    _.isEmpty(flatListInfo)
  );
  const [flatListInfo, setFlatListInfo] = useState([]);
  const [searchText, setSearchText] = useState(null);
  const [flatListToRender, setFlatListToRender] = useState(null);
  // const [disableRefresh, setDisableRefresh] = useState(false);
  const [selectedTag, setSelectedTag] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);

  // const scrollOffset = useRef(0);

  useEffect(() => {
    trackScreen("Home");
  }, []);

  useEffect(() => {
    const storeSpecificURL =
      Platform.OS === "ios"
        ? "https://apps.apple.com/tt/app/mufasa/id1599042855"
        : "https://play.google.com/store/apps/details?id=com.mufasaapp";

    const currentVersion = VersionCheck.getCurrentVersion();
    const latestVersion = VersionCheck.getLatestVersion();

    VersionCheck.getLatestVersion({}).then((latestVersion) => {
      const treatedLatestVersion = latestVersion.split(".");
      const treatedCurrentVersion = currentVersion.split(".");

      if (treatedCurrentVersion[0] < treatedLatestVersion[0]) {
        showAlertToUpdateApp(storeSpecificURL);
      } else if (treatedCurrentVersion[0] == treatedLatestVersion[0]) {
        if (treatedCurrentVersion[1] < treatedLatestVersion[1]) {
          showAlertToUpdateApp(storeSpecificURL);
        }
      }
    });
  }, []);

  const showAlertToUpdateApp = (storeURL) => {
    Alert.alert(
      "New version available!",
      "Get the latest version for a better experience.",
      [
        {
          text: "Update",
          onPress: () => {
            Linking.canOpenURL(storeURL).then((linkingResponse) => {
              if (linkingResponse) {
                Linking.openURL(storeURL);
              } else {
                Alert.alert(
                  "Whoops",
                  "It seems that the link cannot be opened. Please contact our team or try to access the privacy policy at the following URL: https://www.mufasaglobal.com/",
                  { cancelable: true }
                );
              }
            });
          },
          style: "default",
        },
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    const searchList = [];

    if (!_.isEmpty(selectedTag)) {
      _.forEach(flatListInfo, (item) => {
        const {
          club_tags = null,
          service_tags = null,
          activity_tags = null,
          restaurant_tags = null,
        } = item || {};

        if (club_tags || service_tags || activity_tags || restaurant_tags) {
          const tagList =
            club_tags ?? service_tags ?? activity_tags ?? restaurant_tags;
          for (let i = 0; i < tagList.length; ++i) {
            const tagItem = tagList[i];
            if (_.includes(selectedTag, tagItem)) {
              searchList.push(item);
              break;
            }
          }
        }
      });
    }

    if (!_.isEmpty(searchText)) {
      _.forEach(flatListInfo, (item) => {
        if (
          _.includes(
            item.general_information.name.toLowerCase().replace(/'/, ""),
            searchText.toLowerCase().replace(" ", "")
          )
        ) {
          searchList.push(item);
        }
      });
    }

    setFlatListToRender(
      _.isEmpty(searchText) && _.isEmpty(selectedTag)
        ? flatListInfo
        : searchList
    );
  }, [searchText, flatListInfo, selectedTag]);

  useEffect(() => {
    if (isFocused) {
      setFlatListInfo("");
      setFlatListToRender("");
      console.log("========================================isFocused is true");
      // Alert.alert(flatListInfo.size)
      // setShowCategorySelector(true);
      switch (selectedCategory?.name) {
        case configs.SCREEN_CONFIG.SERVICE.name:
          getServices(selectedCity).then((info) => {
            // console.log(JSON.stringify(info));
            const listWithResourceType = _.map(info?.data, (currentItem) => {
              return {
                ...currentItem,
                resource_type: configs.VENDOR_TYPES.SERVICE,
              };
            });
            setFlatListInfo(listWithResourceType);
            stopLoader();
          });

          break;
        case configs.SCREEN_CONFIG.EXPERIENCE.name:
          getActivities(selectedCity).then((info) => {
            // console.log(JSON.stringify(info));
            const listWithResourceType = _.map(info?.data, (currentItem) => {
              return {
                ...currentItem,
                resource_type: configs.VENDOR_TYPES.ACTIVITY,
              };
            });
            setFlatListInfo(listWithResourceType);
            stopLoader();
          });
          break;

        case configs.SCREEN_CONFIG.EXQUISITE.name:
          getExquisiteList(selectedCity).then((info) => {
            // console.log(JSON.stringify(info));
            const listWithResourceType = info?.data;
            setFlatListInfo(listWithResourceType);
            stopLoader();
          });
          break;
      }
      // setDisableRefresh(false);
    }
  }, [isFocused, selectedCity, selectedCategory]);

  useEffect(() => {
    setSelectedTag([]);
  }, [selectedCity, selectedCategory]);

  useEffect(() => {
    setSelectedSubCategory([]);
  }, [selectedCity, selectedCategory]);

  // useEffect(() => {
  //     if (isFocused) {
  //         setShowCategorySelector(true);
  //         switch (selectedCategory?.name) {
  //             case configs.SCREEN_CONFIG.SERVICE.name:
  //                 getServices(selectedCity).then(info => {
  //                     const listWithResourceType = _.map(info?.data, currentItem => {
  //                         return {
  //                             ...currentItem,
  //                             resource_type: configs.VENDOR_TYPES.SERVICE,
  //                         };
  //                     });
  //                     setFlatListInfo(listWithResourceType);
  //                     stopLoader();
  //                 });

  //                 break;
  //             case configs.SCREEN_CONFIG.EXPERIENCE.name:
  //                 getActivities(selectedCity).then(info => {
  //                     const listWithResourceType = _.map(info?.data, currentItem => {
  //                         return {
  //                             ...currentItem,
  //                             resource_type: configs.VENDOR_TYPES.ACTIVITY,
  //                         };
  //                     });
  //                     setFlatListInfo(listWithResourceType);
  //                     stopLoader();
  //                 });
  //                 break;

  //             case configs.SCREEN_CONFIG.EXQUISITE.name:
  //                 getExquisiteList(selectedCity).then(info => {
  //                     const listWithResourceType = info?.data;
  //                     setFlatListInfo(listWithResourceType);
  //                     stopLoader();
  //                 });
  //                 break;
  //         }
  //     } else {
  //         setIsLoadingVendors(true);
  //     }
  // }, [selectedCity, selectedCategory]);

  // functions
  const stopLoader = () => {
    setTimeout(() => {
      setIsLoadingVendors(false);
    }, 80);
  };

  const onPressCategory = async (categoryItem) => {
    setSelectedCategory(categoryItem);
    setFlatListToRender(null);
    setSearchText(null);
    await trackEventNormal("Home_page_catagory_" + categoryItem?.name);
  };

  const getExquisiteList = async (location) => {
    const exquisiteData = await Promise.all([
      getRestos(location),
      getClubs(location),
    ]);

    const restrosList = _.map(exquisiteData[0].data, (restroItem) => {
      return {
        ...restroItem,
        resource_type: configs.VENDOR_TYPES.RESTAURANT,
      };
    });

    const clubList = _.map(exquisiteData[1].data, (restroItem) => {
      return {
        ...restroItem,
        resource_type: configs.VENDOR_TYPES.CLUB,
      };
    });

    return { data: [...restrosList, ...clubList] };
  };

  const renderHeader = useCallback(
    () => (
      <View
        style={{
          zIndex: 1,
          backgroundColor: "#fff",
          width: "100%",
          paddingHorizontal: 16,
          marginBottom: 20,
        }}
      >
        <View>
          <View
            style={{
              paddingTop: 0,
              paddingVertical: 16,
            }}
          >
            <View
            // style={{
            //   elevation: 4,
            //   backgroundColor: "#00000050",
            //   shadowColor: "black",
            //   shadowOffset: { height: 2, width: 0 },
            //   shadowOpacity: 0.2,
            //   shadowRadius: 8,
            //   borderRadius: 5,
            // }}
            >
              <Image
                source={{
                  uri: bannerImages[selectedCity]?.[selectedCategory?.name],
                }}
                style={{ height: 115, borderRadius: 0 }}
                resizeMode="contain"
              />
            </View>
          </View>
          <ScrollView horizontal>
            {_.map(configs.SCREEN_CONFIG, (categoryItem) => {
              const isSelected = selectedCategory?.name === categoryItem?.name;
              return (
                <Pressable
                  key={categoryItem?.name}
                  onPress={() => onPressCategory(categoryItem)}
                  style={[
                    styles.categoryButton,
                    {
                      zIndex: 1,
                      backgroundColor: isSelected
                        ? categoryItem?.categoryColor
                        : "rgba(9, 30, 66, 0.04)",
                    },
                  ]}
                >
                  <Text style={{ color: isSelected ? "#fff" : "#000" }}>
                    {categoryItem?.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text
            style={[
              { color: selectedCategory?.categoryColor },
              { marginTop: 8 },
            ]}
          >
            {selectedCategory?.categoryTitle}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchTextInputView}>
            <FontAwesome5
              name="search"
              size={14}
              color={selectedCategory?.categoryColor ?? "#000"}
            />
            <TextInput
              style={{ marginLeft: 12, flex: 1, color: "#000" }}
              placeholder={`Search for ${selectedCategory?.name?.toLowerCase()}`}
              onChangeText={setSearchText}
              // value={searchText}
            />
          </View>

          <Pressable
            onPress={() => {
              setShowFilterModal(true);
            }}
            style={{
              marginLeft: 12,
              backgroundColor: "rgba(9, 30, 66, 0.2)",
              borderRadius: 3,
              paddingHorizontal: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#000" }}>Filter </Text>
            <MaterialIcons name="filter-alt" size={16} color="#000" />
          </Pressable>
        </View>
      </View>
    ),
    [selectedCity, selectedCategory.name]
  );

  return (
    <SafeAreaView style={styles.container} forceInset={{ bottom: "never" }}>
      <View style={{ flex: 1 }}>
        {/* header */}
        <View style={styles.headerContainer}>
          <Image
            source={require("../../../assets/images/icons/logoIcon.png")}
            style={styles.appIconImage}
            resizeMode="contain"
          />
          <Pressable
            onPress={() => {
              navigation.navigate("UserProfile");
            }}
          >
            <UserAvatar />
          </Pressable>
        </View>
        {/* location picker */}
        <View style={{ paddingHorizontal: 16, marginTop: 12, zIndex: 999 }}>
          <LocationPicker />
        </View>

        {isLoadingVendors ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <ActivityIndicator
              size="large"
              color={selectedCategory?.categoryColor}
            />
          </View>
        ) : (
          <View
            style={{
              marginBottom: 116,
            }}
          >
            <FlatList
              stickyHeaderHiddenOnScroll
              scrollEventThrottle={16}
              stickyHeaderIndices={[0]}
              ListHeaderComponent={renderHeader}
              alwaysBounceHorizontal={false}
              alwaysBounceVertical={false}
              data={flatListToRender ?? flatListInfo}
              keyExtractor={(item) => item?._id}
              renderItem={({ item }) => {
                return (
                  <View style={{ paddingHorizontal: 16 }}>
                    <VendorCard
                      navigation={navigation}
                      vendorData={item}
                      onPress={async () => {
                        // setDisableRefresh;
                        await trackEventNormal("Home_page_all_vendors");
                      }}
                      selectedCategory={selectedCategory}
                    />
                  </View>
                );
              }}
            />
          </View>
        )}
      </View>

      <Modal
        visible={showFilterModal}
        presentationStyle="formSheet"
        onRequestClose={() => setShowFilterModal(false)}
        animationType="slide"
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "#fff",
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 12,
                paddingVertical: 20,
              }}
            >
              <Text style={{ color: "#000" }}>Filter</Text>
              <Pressable
                hitSlop={20}
                onPress={() => {
                  setShowFilterModal(false);
                }}
              >
                <FontAwesome5
                  name="times"
                  size={16}
                  color="rgba(74, 74, 74, 1)"
                  style={{ marginRight: 12 }}
                  brand
                />
              </Pressable>
            </View>

            <RenderFilterList
              selectedCategory={selectedCategory}
              selectedSub={selectedSubCategory}
              setSelectedSub={setSelectedSubCategory}
              setSelectedTag={setSelectedTag}
              selectedTag={selectedTag}
            />
          </View>

          <Pressable
            onPress={() => {
              setShowFilterModal(false);
              // getExquisiteList(selectedCity, selectedCategory).then((info) => {
              //   console.log(JSON.stringify(info));
              //   const listWithResourceType = info?.data;
              //   setFlatListInfo(listWithResourceType);
              //   stopLoader();
              // });
            }}
            style={{
              padding: 16,
              backgroundColor: selectedCategory.categoryColor,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff" }}>APPLY FILTER</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
      {/*<FloatingButton />*/}
    </SafeAreaView>
  );
};

const RenderFilterList = (props) => {
  const {
    selectedCategory,
    selectedSub = [],
    setSelectedSub = () => null,
    setSelectedTag = () => null,
    selectedTag = [],
  } = props || {};

  const [subCategories, setSubCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [dashParams, setDashParams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [selectedSubCategory, setSelectedSubCategory] = useState([]);

  useEffect(() => {
    console.log("useEffect called for empty erray");
    getDashboardParams().then(setDashParams);
    console.log(dashParams);
    trackScreen("RenderFilterList");
  }, []);

  useEffect(() => {
    console.log("useEffect called for dashParams");
    switch (selectedCategory.name) {
      case configs.SCREEN_CONFIG.EXQUISITE.name: {
        setSubCategories(["club_tags", "restaurant_tags"]);
        //setSelectedSubCategory(["club_tags", "restaurant_tags"]);
        break;
      }
      case configs.SCREEN_CONFIG.EXPERIENCE.name: {
        setSubCategories(["activity_tags"]);
        setSelectedSub(["activity_tags"]);
        break;
      }
      case configs.SCREEN_CONFIG.SERVICE.name: {
        setSubCategories(["service_tags"]);
        setSelectedSub(["service_tags"]);
        break;
      }
    }
  }, [dashParams]);

  useEffect(() => {
    console.log("useEffect called for selectedSub");
    console.log(dashParams);
    const tagsList = [];
    _.forEach(selectedSub, (category) => {
      _.forEach(dashParams[category], (tag) => {
        tagsList.push(tag);
      });
    });
    setTags(tagsList);
    setIsLoading(false);
    // if (_.isEmpty(selectedTag)) {
    //   setSelectedTag(tagsList);
    // }
  }, [subCategories, selectedSub]);

  const onSubCategorySelect = (category) => {
    const indexIfExist = _.indexOf(selectedSub, category);
    if (indexIfExist > -1) {
      const newSelectedSubCategory = [...selectedSub];
      newSelectedSubCategory.splice(indexIfExist, 1);
      setSelectedSub(newSelectedSubCategory);
    } else {
      setSelectedSub([...selectedSub, category]);
    }
  };

  const onTagSelect = (tag) => {
    const indexIfExist = _.indexOf(selectedTag, tag);
    if (indexIfExist > -1) {
      const newSelectedTab = [...selectedTag];
      newSelectedTab.splice(indexIfExist, 1);
      setSelectedTag(newSelectedTab);
    } else {
      setSelectedTag([...selectedTag, tag]);
    }
  };

  return (
    <ScrollView style={{ paddingHorizontal: 16, flex: 1 }}>
      {isLoading ? (
        <ActivityIndicator
          color={selectedCategory.categoryColor}
          size="large"
        />
      ) : (
        <View>
          {subCategories.length > 1 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 12, color: "#000" }}>
                Categories
              </Text>
              <View style={{ flexDirection: "row" }}>
                {_.map(subCategories, (subCategory) => {
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "40%",
                        marginRight: 8,
                      }}
                    >
                      <CheckBox
                        value={_.includes(selectedSub, subCategory)}
                        onValueChange={() => {
                          onSubCategorySelect(subCategory);
                        }}
                        tintColors={{
                          true: selectedCategory.categoryColor,
                          false: "#efefef",
                        }}
                        tintColor="#efefef"
                        onCheckColor="#fff"
                        onFillColor={selectedCategory.categoryColor}
                        onTintColor={selectedCategory.categoryColor}
                        animationDuration={0}
                      />
                      <Text
                        style={[
                          { color: "#000" },
                          Platform.OS === "ios" && {
                            marginLeft: 8,
                          },
                        ]}
                      >
                        {subCategory.replace("_tags", "").toUpperCase()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          {!_.isEmpty(tags) && (
            <Text style={{ marginBottom: 12, color: "#000" }}>Tags</Text>
          )}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {_.map(tags, (tag) => {
              return (
                <View
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      width: "40%",
                      marginRight: 8,
                    },
                    Platform.OS === "ios" && {
                      marginBottom: 12,
                    },
                  ]}
                >
                  <CheckBox
                    value={_.includes(selectedTag, tag)}
                    onValueChange={() => {
                      onTagSelect(tag);
                    }}
                    tintColors={{
                      true: selectedCategory.categoryColor,
                      false: "#efefef",
                    }}
                    tintColor="#efefef"
                    onCheckColor="#fff"
                    onFillColor={selectedCategory.categoryColor}
                    onTintColor={selectedCategory.categoryColor}
                    animationDuration={0}
                  />
                  <Text
                    style={[
                      { color: "#000", flex: 1 },
                      Platform.OS === "ios" && {
                        marginLeft: 8,
                      },
                    ]}
                  >
                    {tag}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  searchTextInputView: {
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#DFE1E6",
    flex: 1,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  searchContainer: {
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 12,
  },
  container: {
    flex: 1,
    backgroundColor: configs.COLORS.whitePrimary,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 40,
    marginBottom: 12,
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

export default Home;
