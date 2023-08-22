import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SimpleAnimation} from 'react-native-simple-animations';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {configs} from '../../values/config';

const SliderState = ({slide}) => {
  return (
    <View style={styles.sliderStateContainer}>
      <ArrowLine angle="0" />
      <SlideStateBox active={slide == 1} />
      <SlideStateBox active={slide == 2} />
      <SlideStateBox active={slide == 3} />
      <SlideStateBox active={slide == 4} />
      <SlideStateBox active={slide == 5} />
      <SlideStateBox active={slide == 6} />
      <ArrowLine angle="180" />
    </View>
  );
};

const ArrowLine = ({angle}) => {
  return (
    <View
      style={{
        transform: [{rotate: `${angle}deg`}],
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: 10,
      }}>
      <FontAwesome5 color="#FCDA80" size={10} name="chevron-left" />
      <View style={{width: 60, height: 1, backgroundColor: '#FCDA80'}} />
    </View>
  );
};

const SlideStateBox = ({active}) => {
  if (active) {
    return (
      <SimpleAnimation
        aim="in"
        delay={500}
        duration={1500}
        animate
        animateOnUpdate
        movementType="spring"
        distance={0}
        staticType="bounce"
        direction="up">
        <View
          style={{
            width: 9,
            height: 9,
            backgroundColor: '#00000000',
            borderColor: '#FCDA80',
            borderWidth: 2,
            transform: [{rotate: '45deg'}],
            marginHorizontal: 6,
          }}
        />
      </SimpleAnimation>
    );
  } else {
    return (
      <SimpleAnimation
        aim="in"
        delay={0}
        duration={1500}
        animate
        animateOnUpdate={false}
        fade
        distance={0}>
        <View
          style={{
            width: 9,
            height: 9,
            backgroundColor: '#FCDA80',
            transform: [{rotate: '45deg'}],
            marginHorizontal: 5,
          }}
        />
      </SimpleAnimation>
    );
  }
};

const Intro = ({submitHandler}) => {
  const [slideColor, setSlideColor] = useState('#1B342F');
  const [touchX, setTouchX] = useState(0);
  const [updates, setUpdates] = useState(false);
  const [slide, setSlide] = useState(1);
  const [prevSlide, setPrevSlide] = useState(0);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => handleLeftSwipe(), 3000);
    return () => clearInterval(id);
  }, [slide]);

  const handleLeftSwipe = () => {
    if (slide < 6) {
      const s = slide;
      setSlide(s + 1);
      setPrevSlide(s);
      switch (s + 1) {
        case 1:
          setSlideColor('#1B342F');
          break;
        case 2:
          setSlideColor('#141C38');
          break;
        case 3:
          setSlideColor('#CEAD5C');
          break;
        case 4:
          setSlideColor('#CEAD5C');
          break;
        case 5:
          setSlideColor('#1B342F');
          break;
        case 6:
          setSlideColor('#fcda80');
          break;
        default:
          setSlideColor('#1B342F');
      }
    }
  };
  const handleRightSwipe = () => {
    if (slide > 1) {
      const s = slide;
      setSlide(s - 1);
      setPrevSlide(s);
      switch (s - 1) {
        case 1:
          setSlideColor('#1B342F');
          break;
        case 2:
          setSlideColor('#141C38');
          break;
        case 3:
          setSlideColor('#CEAD5C');
          break;
        case 4:
          setSlideColor('#CEAD5C');
          break;
        case 5:
          setSlideColor('#1B342F');
          break;
        case 6:
          setSlideColor('#141C38');
          break;
        default:
          setSlideColor('#1B342F');
      }
    }
  };
  return (
    <>
      <ImageBackground
        source={
          [1, 6].includes(slide)
            ? slide === 1
              ? require('../../../assets/images/screens/entry.png')
              : require('../../../assets/images/screens/exit.png')
            : require(`../../../assets/images/backgrounds/mainIntroBg.jpg`)
        }
        imageStyle={styles.containerBackground}>
        <SafeAreaView style={{flex: 1}}>
          {[1, 6].includes(slide) ? null : (
            <View
              style={{
                position: 'absolute',
                backgroundColor: slideColor,
                height: Dimensions.get('window').height * 0.5,
                width: Dimensions.get('window').width + 500,
                left: -200,
                top: -150,
                transform: [{rotate: '-20deg'}],
                shadowColor: '#000000',
                shadowOffset: {width: 5, height: 5},
                shadowRadius: 10,
                shadowOpacity: 0.5,
              }}
            />
          )}
          <View
            onTouchStart={e => setTouchX(e.nativeEvent.pageX)}
            onTouchEnd={e => {
              if (touchX - e.nativeEvent.pageX > 50) {
                handleLeftSwipe();
              } else if (e.nativeEvent.pageX - touchX > 50) {
                handleRightSwipe();
              }
            }}
            style={[
              styles.container,
              slide === 1 && {justifyContent: 'center'},
            ]}>
            {slide === 1 ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <SliderState slide={slide} />
              </View>
            ) : (
              <SliderState slide={slide} />
            )}

            <View style={styles.textContainer}>
              <Text style={styles.header}>
                {slide == 1 && (
                  <Text
                    style={{
                      color: '#d4824c',
                      fontSize: 20,
                      fontWeight: 'bold',
                      fontFamily: configs.FONTS.PRIMARY_FONT,
                    }}>
                    Welcome to Mufasa!
                  </Text>
                )}
                {slide == 2 && 'Step 1 : \n Choose a destination'}
                {slide == 3 && 'Step 2 : \n Pick what you need'}
                {slide == 4 && "Step 3 : \n Browse through the city's best"}
                {slide == 5 && 'Step 4 : \n Make a reservation from the app'}
                {slide == 6 &&
                  'Step 5 : \n Enjoy your exquisite experience, \n with ease'}
              </Text>
              <Text style={styles.subtitle}>
                {slide == 1 && (
                  <Text
                    style={{
                      color: '#d4824c',
                      fontFamily: configs.FONTS.PRIMARY_FONT,
                    }}>
                    {
                      " Your ultimate guide to the citys's \n finest experiences"
                    }
                  </Text>
                )}
                {/* {slide == 2 &&
                'Have you had enough of scrolling non-stop,\nconstantly flicking through apps?'} */}
                {/* {slide == 3 &&
                'You do not have to go through the\ntask of searching for the best places\nwith the best reviews,'} */}
                {/* {slide == 4 &&
                'Our best critics have reviewed\neach restaurant, hotel, activity and service.'} */}
                {/* {slide == 5 &&
                'Our system is seamless,\nwe make it as easy as possible.'} */}
                {/* {slide == 6 && 'You may now\nProceed with ease'} */}
              </Text>
              <Text style={styles.subtitle}>
                {/* {slide == 1 && "Here's how simple it is\nto use Mufasa..."} */}
                {/* {slide == 2 && 'We have... therefore... We bring you. Mufasa.'} */}
                {/* {slide == 3 && "We've done it for you."} */}
                {slide == 4 && 'Curated by Mufasa'}
                {slide == 5 &&
                  'Choose from offers and packages \n EXCLSIVE to Mufasa Users'}
                {/* {slide == 6 && ''} */}
              </Text>
            </View>
            {[1, 6].includes(slide) ? null : (
              <ScreenImg slide={slide} prevSlide={prevSlide} />
            )}
          </View>

          {/* <StatusBar
            backgroundColor={slideColor}
            animated
            barStyle="light-content"
          /> */}
        </SafeAreaView>
      </ImageBackground>
      {slide === 6 && (
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.submitContainer}
          colors={['#00000000', '#000000F5']}>
          <TouchableHighlight
            style={styles.continueButton}
            onPress={() => submitHandler()}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0.5}}
              style={styles.continue}
              colors={[configs.COLORS.goldenLight, configs.COLORS.goldenDark]}>
              <Text style={styles.continueText}>Get Started</Text>
            </LinearGradient>
          </TouchableHighlight>
        </LinearGradient>
      )}
    </>
  );
};

const ScreenImg = ({slide, prevSlide}) => {
  return (
    <SimpleAnimation
      aim="in"
      delay={0}
      duration={500}
      animate
      animateOnUpdate={false}
      movementType="slide"
      distance={500}
      fade={false}
      direction={prevSlide > slide ? 'right' : 'left'}>
      {slide == 2 && (
        <Image
          source={require('../../../assets/images/screens/intro1screen.png')}
          style={styles.screen}
        />
      )}
      {slide == 3 && (
        <Image
          source={require('../../../assets/images/screens/intro2screen.png')}
          style={styles.screen}
        />
      )}
      {slide == 4 && (
        <Image
          source={require('../../../assets/images/screens/intro3screen.png')}
          style={styles.screen}
        />
      )}
      {slide == 5 && (
        <Image
          source={require('../../../assets/images/screens/intro4screen.png')}
          style={styles.screen}
        />
      )}
    </SimpleAnimation>
  );
};

const OnBoard = props => {
  const setFirstTime = async () => {
    try {
      await AsyncStorage.setItem('@firstTime', 'set');
      props.navigation.navigate('Home');
    } catch (err) {
      console.log(err);
    }
  };

  const checkFirst = async () => {
    try {
      const value = await AsyncStorage.getItem('@firstTime');
      if (value !== null) {
        props.navigation.navigate('Home');
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    checkFirst();
  }, []);
  return <Intro submitHandler={setFirstTime} />;
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: Dimensions.get('window').width - 30,
    height:
      Dimensions.get('window').height - (Platform.OS === 'ios' ? 100 : 50),
    borderColor: '#FCDA80',
    borderWidth: 1,
    borderRadius: 20,
    margin: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerBackground: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    resizeMode: 'stretch',
  },
  sliderStateContainer: {
    width: '100%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    color: configs.COLORS.whitePrimary,
    textShadowColor: '#fff',
    textShadowOffset: {width: 0.1, height: 0.1},
    textShadowRadius: 1,
    marginVertical: 15,
  },
  subtitle: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    color: configs.COLORS.whitePrimary,
    fontWeight: '500',
    marginVertical: 5,
  },
  screen: {
    resizeMode: 'contain',
    height: '82%',
    top: 0,
  },
  textContainer: {
    width: '100%',
    height: '20%',
  },
  submitContainer: {
    width: '100%',
    height: 200,
    position: 'absolute',
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  continueButton: {
    width: '70%',
    height: 50,
    marginBottom: Platform.OS === 'ios' ? 100 : 40,
  },
  continue: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    fontSize: 20,
    fontFamily: configs.FONTS.SECONDARY_FONT,
    textTransform: 'capitalize',
  },
});

export default OnBoard;
