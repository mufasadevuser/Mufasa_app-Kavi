import {useIsFocused} from '@react-navigation/native';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {TitleQ} from '../../components';
import {VendorCard} from '../../components/cards';
import {getFavourites} from '../../controller/user';

export const Favourites = ({route, navigation}) => {
  const [favouritesList, setFavouritesList] = useState();
  const isFocused = useIsFocused();

  useEffect(() => {
    loadData();
  }, [isFocused]);

  const loadData = async () => {
    let favouritesList = (await getFavourites()).data;
    favouritesList = _.filter(
      favouritesList,
      item => item.resource_id?.general_information,
    );
    setFavouritesList(favouritesList);
  };

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
          <TitleQ text="Favourites" size={25} color="#FCDA80" />
        </View>
        <FlatList
          contentContainerStyle={styles.scrollContainer}
          data={favouritesList}
          keyExtractor={item => item?._id}
          renderItem={data => {
            const {item} = data;
            return (
              <VendorCard
                key={item._id}
                navigation={navigation}
                vendorData={{...item.resource_id, favourite: {_id: ''}}}
                serviceType={item.resource_type}
                selectedCategory="EXQUISITE"
              />
            );
          }}
        />
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
    width: Dimensions.get('screen').width - 40,
    paddingHorizontal: 14,
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    marginVertical: 12,
    fontSize: 18,
  },
});
