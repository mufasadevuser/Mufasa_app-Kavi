import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {TitleQ} from '../../components';

const About = ({route, navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.logoToggleBar}>
            <Image
              style={styles.logoIcon}
              source={require('../../../assets/images/icons/logoIcon.png')}
            />
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backIcon}>
              <FontAwesome5
                style={styles.icons}
                name="arrow-left"
                size={25}
                color="#FCDA80"
              />
            </TouchableOpacity>
            <TouchableOpacity
              underlayColor="#00000010"
              onPress={() => navigation.toggleDrawer()}
              style={styles.sidebarToggle}>
              <Image
                style={styles.toggleIcon}
                source={require('../../../assets/images/icons/toggleIcon.png')}
              />
            </TouchableOpacity>
          </View>
          <TitleQ text="About Mufasa" size={25} color="#FCDA80" />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.text}>
            A single app, curated for Urban Luxury Consider us your “Best”
            filter for services and things to do in the city.
          </Text>
          <Text style={styles.text}>
            No more shuffling through apps. No more scrolling through review
            sites. No more wondering if ratings have been sponsored. Our team
            does a deep dive into the city to find you the finest.
          </Text>
          <Text style={styles.text}>
            We do the research, and bring you exclusive app-only offers and
            add-ons to enhance your experience as much as possible. Something
            not up to the mark? Let us know! To know more, visit us at
            www.mufasaglobal.xyz
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    width: Dimensions.get('window').width - 30,
    height:
      Dimensions.get('window').height - (Platform.OS === 'ios' ? 100 : 50),
    borderColor: '#FCDA80',
    borderWidth: 2,
    borderRadius: 20,
    margin: 15,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#161A46',
  },
  headerContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#161A46',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 10},
    elevation: 7,
    shadowRadius: 10,
    shadowOpacity: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
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
    right: 15,
    top: 0,
    position: 'absolute',
  },
  toggleIcon: {
    width: '100%',
    resizeMode: 'contain',
  },
  backIcon: {
    top: 10,
    left: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  icons: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 7,
  },
  logoIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  scrollContainer: {
    width: '100%',
    padding: 24,
  },
  text: {
    color: '#fff',
    marginVertical: 12,
    fontSize: 18,
  },
});

export default About;
