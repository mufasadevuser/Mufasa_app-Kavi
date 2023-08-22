import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDrawerStatus} from '@react-navigation/drawer';
import {useIsFocused} from '@react-navigation/native';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import {SimpleAnimation} from 'react-native-simple-animations';

import {TitleQ} from '../../components';
import {configs} from '../../values/config';
import analytics from "@react-native-firebase/analytics";
import {trackEventNormal} from "../../controller/analytics";

const CategoryButton = ({
  bgColor,
  textColor,
  title,
  subtitle,
  navigation,
  delay,
  direction,
  city,
  category,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  return (
    <SimpleAnimation
      aim="in"
      delay={delay}
      duration={1000}
      animate
      animateOnUpdate={false}
      movementType="slide"
      distance={100}
      direction={direction}>
      <TouchableHighlight
        onPressIn={() => {
          setIsPressed(true);
        }}
        onPressOut={() => {
          setIsPressed(false);
        }}
        onPress={async () => {
          navigation.navigate('VendorListing', {pcity: city, category});
          await trackEventNormal('Home_page_catagory_'+title)
        }}
        style={{...styles.buttonContainer, backgroundColor: bgColor}}
        underlayColor="#FCDA80D0">
        <>
          <Text
            style={{...styles.title, color: isPressed ? '#fff' : textColor}}>
            {title}
          </Text>
          <Text
            style={{...styles.subtitle, color: isPressed ? '#fff' : textColor}}>
            {subtitle}
          </Text>
        </>
      </TouchableHighlight>
    </SimpleAnimation>
  );
};

const CityButton = ({city, handleCity}) => (
  <TouchableHighlight
    onPress={() => handleCity(city)}
    style={styles.cityButton}>
    <Text style={styles.cityButtonText}>{city.toUpperCase()}</Text>
  </TouchableHighlight>
);

const Home = ({route, navigation}) => {
  const showCitySelection = route.params?.showCitySelection;
  const isFocused = useIsFocused();
  const isDrawerVisible = useDrawerStatus() === 'open';
  const [currentCity, setCurrentCity] = useState('');
  const isCitySelected = !_.isEmpty(currentCity);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
  }, []);

  useEffect(() => {
    const func = async () => {
      const city = await AsyncStorage.getItem('@city');
      if (_.isEmpty(city)) {
        setCurrentCity('');
      } else {
        setCurrentCity(city);
      }
    };
    if (showCitySelection) {
      AsyncStorage.setItem('@city', '').then(() => {
        navigation.setParams({
          showCitySelection: false,
        });
        setCurrentCity('');
      });
    } else func();
  }, [isFocused, isDrawerVisible, showCitySelection]);

  const handleCity = async city => {
    await trackEventNormal('Home page_Location_'+city)
    try {
      setCurrentCity(city);
      await AsyncStorage.setItem('@city', city);
    } catch (e) {
      console.log('Error saving city', e);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/backgrounds/homebg.jpg')}
      style={styles.container}
      imageStyle={styles.containerBackground}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.innerContainer}>
          <View style={styles.headerContainer}>
            <Image
              style={styles.headerLogo}
              source={require('../../../assets/images/logo.png')}
            />
            {isCitySelected && (
              <SimpleAnimation
                aim="in"
                delay={0}
                duration={1000}
                animate
                animateOnUpdate={false}
                movementType="slide"
                distance={100}
                direction="right"
                style={styles.sidebarToggle}>
                <TouchableHighlight
                  underlayColor="#00000010"
                  onPress={() => navigation.toggleDrawer()}>
                  <Image
                    style={styles.toggleIcon}
                    source={require('../../../assets/images/icons/toggleIcon.png')}
                  />
                </TouchableHighlight>
              </SimpleAnimation>
            )}
          </View>
          {!isCitySelected ? (
            <SimpleAnimation
              aim="in"
              delay={200}
              duration={1000}
              animate
              animateOnUpdate={false}
              movementType="slide"
              distance={0}
              direction="down">
              <View style={styles.cityContainer}>
                <TitleQ text="Where you off to?" size={25} color="#FCDA80" />
                <View style={styles.squareLineContainer}>
                  <View style={styles.squareLineSquare} />
                  <View style={styles.squareLine} />
                  <View style={styles.squareLineSquare} />
                </View>
                <CityButton city="Dubai" handleCity={handleCity} />
                <View style={styles.middleSquare} />
                <CityButton city="Goa" handleCity={handleCity} />
                <Text style={styles.nextCityText}>
                  {'THAILAND & BALI\nComing Soon'}
                </Text>
              </View>
            </SimpleAnimation>
          ) : (
            <View style={styles.bottomContainer}>
              {/* <TitleQ text={currentCity} size={20} color={'#FCDA80'} /> */}
              <CategoryButton
                bgColor="#161A46E0"
                textColor="#FCDA80"
                title="Exquisite"
                subtitle="Restaurant and Club Booking"
                delay={100}
                direction="left"
                city={currentCity}
                navigation={navigation}
                category={configs.CATEGORIES.EXQUISITE}
              />
              <CategoryButton
                bgColor="#244941E0"
                textColor="#FCDA80"
                title="Experience"
                subtitle="Activities"
                delay={200}
                direction="right"
                city={currentCity}
                navigation={navigation}
                category={configs.CATEGORIES.EXPERIENCE}
              />
              <CategoryButton
                bgColor="#5A0C1AE0"
                textColor="#FCDA80"
                title="Ease"
                subtitle="Services at your doorstep"
                delay={400}
                direction="left"
                city={currentCity}
                navigation={navigation}
                category={configs.CATEGORIES.SERVICE}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  sidebarToggle: {
    width: 30,
    height: 30,
    left: 24,
    top: 0,
    position: 'absolute',
  },
  toggleIcon: {
    width: '100%',
    resizeMode: 'contain',
  },
  containerBackground: {
    resizeMode: 'cover',
  },
  innerContainer: {
    borderColor: '#FCDA80',
    borderWidth: 2,
    borderRadius: 20,
    margin: 15,
    alignItems: 'center',
    flex: 1,
  },
  bottomContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  buttonContainer: {
    width: Dimensions.get('window').width - 60,
    height: 80,
    marginVertical: 5,
    borderRadius: 10,
    borderColor: '#FCDA80',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: configs.FONTS.SECONDARY_FONT,
    fontSize: 20,
  },
  subtitle: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
  headerContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerLogo: {
    height: 100,
    resizeMode: 'contain',
  },
  cityContainer: {
    width: Dimensions.get('window').width - 100,
    marginTop: 80,
    borderRadius: 25,
    paddingVertical: 20,
    borderColor: '#FCDA80',
    borderWidth: 1.5,
    backgroundColor: '#1B342FE0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareLineContainer: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  squareLineSquare: {
    width: 7,
    height: 7,
    transform: [{rotate: '45deg'}],
    borderColor: '#FCDA80D0',
    borderWidth: 0.8,
  },
  squareLine: {
    width: '94%',
    borderWidth: 0.5,
    borderColor: '#FCDA80D0',
  },
  cityButton: {
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B342FC0',
    padding: 10,
    borderColor: '#FCDA80',
    borderWidth: 1,
    borderRadius: 7,
    marginVertical: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 1,
    shadowOffset: {width: 0, height: 0},
  },
  cityButtonText: {
    fontSize: 15,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontWeight: '500',
    color: '#FCDA80',
  },
  middleSquare: {
    width: 10,
    height: 10,
    transform: [{rotate: '45deg'}],
    backgroundColor: '#FCDA80',
    marginVertical: 10,
  },
  nextCityText: {
    fontSize: 15,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontWeight: '500',
    color: '#FCDA80',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Home;
