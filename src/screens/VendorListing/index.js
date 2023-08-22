import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {VendorCard} from '../../components/cards';
import {getActivities} from '../../controller/experience';
import {getClubs, getEvents, getRestos} from '../../controller/exquisite';
import {getServices} from '../../controller/service';
import {configs} from '../../values/config';

const Header = ({
  selectedCategory,
  navigation,
  serviceType,
  setServiceType,
  searchText,
  setSearchText,
}) => {
  const screenConfig = configs.SCREEN_CONFIG[selectedCategory];
  const shouldShowTabs = screenConfig.tabs.length > 1;
  return (
    <View
      style={[styles.headerContainer, {height: shouldShowTabs ? 168 : 140}]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backIcon}>
        <FontAwesome5
          style={styles.icons}
          name="arrow-left"
          size={25}
          color="#FCDA80"
        />
      </Pressable>
      <View style={styles.logoToggleBar}>
        <Image
          style={styles.logoIcon}
          source={require('../../../assets/images/icons/logoIcon.png')}
        />
        <TouchableHighlight
          underlayColor="#00000010"
          onPress={() => navigation.toggleDrawer()}
          style={styles.sidebarToggle}>
          <Image
            style={styles.toggleIcon}
            source={require('../../../assets/images/icons/toggleIcon.png')}
          />
        </TouchableHighlight>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          selectionColor="#FFFFFFA0"
          placeholder={screenConfig.placeholder}
          style={[styles.searchField, {backgroundColor: screenConfig.color}]}
          placeholderTextColor="#dedede"
        />
        <TouchableOpacity
          style={{
            ...styles.searchBtn,
            backgroundColor: screenConfig.color,
          }}>
          <Feather name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {shouldShowTabs && (
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          style={{
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{
            width: '100%',
            justifyContent: 'space-around',
          }}>
          {screenConfig.tabs.map((TAB, index) => {
            const isSelected = TAB.serviceType === serviceType;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setServiceType(TAB.serviceType)}
                style={[
                  styles.catButton,
                  isSelected && {
                    backgroundColor: screenConfig.color,
                  },
                ]}>
                <Text
                  style={[
                    styles.catText,
                    {color: screenConfig.color},
                    isSelected && {
                      color: '#FCDA80',
                    },
                  ]}>
                  {TAB.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const ComingSoon = () => (
  <View style={styles.comingSoonContainer}>
    <Text style={styles.comingSoonText}>COMING{'\n'}SOON</Text>
    <Image
      style={styles.logoIcon}
      source={require('../../../assets/images/icons/logoIcon.png')}
    />
  </View>
);

export const VendorListing = ({navigation, route}) => {
  const selectedCategory =
    route?.params?.category ?? configs.CATEGORIES.EXQUISITE;
  const isFocused = useIsFocused();
  const screenConfig = configs.SCREEN_CONFIG[selectedCategory];
  const [serviceType, setServiceType] = useState(
    screenConfig.tabs[0].serviceType,
  );
  const [vendorList, setVendorList] = useState();
  const [filteredVendorList, setFilteredVendorList] = useState();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const isComingSoon = vendorList?.length === 0;

  useEffect(() => {
    loadData();
  }, [serviceType]);

  useEffect(() => {
    if (isFocused) loadData(false);
  }, [isFocused]);

  useEffect(() => {
    setFilteredData();
  }, [searchText]);

  const setFilteredData = () => {
    if (_.isEmpty(searchText)) {
      setFilteredVendorList(vendorList);
      return;
    }
    const filteredData = _.filter(vendorList, vendor => {
      return vendor.general_information?.name
        ?.toLowerCase()
        ?.includes(searchText?.toLowerCase?.());
    });
    setFilteredVendorList(filteredData);
  };

  const loadData = async (shouldShowLoader = true) => {
    shouldShowLoader && setLoading(true);
    let data = [];
    const city = await AsyncStorage.getItem('@city');
    switch (serviceType) {
      case configs.VENDOR_TYPES.CLUB:
        data = (await getClubs(city)).data;
        break;
      case configs.VENDOR_TYPES.RESTAURANT:
        data = (await getRestos(city)).data;
        break;
      case configs.VENDOR_TYPES.EVENT:
        data = (await getEvents(city)).data;
        break;
      case configs.VENDOR_TYPES.ACTIVITY:
        data = (await getActivities(city)).data;
        break;
      case configs.VENDOR_TYPES.SERVICE:
        data = (await getServices(city)).data;
        break;
    }
    data = _.sortBy(data, item => item.packages.length).reverse();
    setVendorList(data);
    setFilteredVendorList(data);
    setSearchText('');
    setLoading(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View
        style={[styles.innerContainer, {backgroundColor: screenConfig.color}]}>
        <Header
          selectedCategory={selectedCategory}
          serviceType={serviceType}
          setServiceType={setServiceType}
          navigation={navigation}
          searchText={searchText}
          setSearchText={setSearchText}
        />
        {isComingSoon && <ComingSoon />}
        {!isComingSoon && loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#FCDA80" />
          </View>
        ) : (
          <FlatList
            data={filteredVendorList}
            style={styles.scrollContainer}
            contentContainerStyle={styles.contentContainerStyle}
            keyExtractor={item => item._id}
            renderItem={data => {
              const {item} = data || {};
              return (
                <VendorCard
                  navigation={navigation}
                  vendorData={item}
                  serviceType={serviceType}
                  selectedCategory={selectedCategory}
                />
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentContainerStyle: {paddingTop: 10},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  innerContainer: {
    borderColor: '#FCDA80',
    borderWidth: 2,
    borderRadius: 20,
    margin: 15,
    alignItems: 'center',
    overflow: 'hidden',
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  logoToggleBar: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarToggle: {
    width: 30,
    height: 30,
    right: 24,
    top: 0,
    position: 'absolute',
  },
  toggleIcon: {
    width: '100%',
    resizeMode: 'contain',
  },
  logoIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  searchContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  searchBtn: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginBottom: 10,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: '#CEAD5C',
    borderRadius: 8,
  },
  searchField: {
    flex: 1,
    marginBottom: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#CEAD5C',
    borderRadius: 8,
    color: '#CEAD5C',
    paddingHorizontal: 15,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontStyle: 'italic',
  },
  scrollContainer: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  catButton: {
    paddingHorizontal: 14,
    height: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    borderColor: '#FCDA80',
    borderWidth: 1,
    marginRight: 4,
  },
  catText: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  comingSoonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  comingSoon: {
    height: 100,
    resizeMode: 'contain',
    marginBottom: 100,
    opacity: 0.8,
  },
  backIcon: {
    top: 10,
    left: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 100,
  },
  comingSoonText: {
    color: '#FCDA80',
    textAlign: 'center',
    letterSpacing: 8,
    lineHeight: 20,
    marginBottom: 12,
  },
});
