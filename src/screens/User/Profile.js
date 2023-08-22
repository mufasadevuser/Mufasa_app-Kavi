import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {InputText, Submit, TitleQ} from '../../components';
import {setProfilePic} from '../../controller/auth';
import {configs} from '../../values/config';

const AvatarButton = ({img, kk, chosenPic, setChosenPic}) => {
  return (
    <TouchableOpacity
      style={kk == chosenPic ? styles.activeSelection : styles.Selection}
      onPress={() => setChosenPic(img)}>
      <Image
        style={styles.avatarImage}
        source={{uri: `${configs.PUBLIC_URL}/profiles/${img}.png`}}
      />
    </TouchableOpacity>
  );
};

const Profile = ({route, navigation}) => {
  const pics = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const [chosenPic, setChosenPic] = useState('1');
  const [name, setName] = useState('');
  const {user} = route.params;

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
  }, []);

  const handleProfileSubmit = async () => {
    try {
      const {data} = await setProfilePic(
        user.token,
        {
          displayName: name,
          photo: chosenPic,
        },
        user.user._id,
      );
      const userData = {
        token: user.token,
        user: data,
      };
      await AsyncStorage.setItem('@auth', JSON.stringify(userData));
      // setTimeout(() => navigation.navigate('OnBoard'), 1000);
    } catch (err) {
      console.log(err);
    } finally {
      setTimeout(() => navigation.navigate('OnBoard'), 250);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                <FontAwesome5 style={styles.icons} name={'arrow-left'} size={25} color={'#FCDA80'} />
            </TouchableOpacity> */}
        <View style={styles.title}>
          <TitleQ text="Select your Avatar" size={25} color="#FCDA80" />
        </View>
        <View style={styles.AvatarContainer}>
          <View style={styles.avatarGrid}>
            {pics.map(i => (
              <AvatarButton
                kk={i}
                img={i}
                chosenPic={chosenPic}
                setChosenPic={setChosenPic}
              />
            ))}
          </View>
          <InputText
            label="Your Display Name"
            value={name}
            setValue={setName}
            align="center"
          />
          <Submit label="Continue" handleSubmit={handleProfileSubmit} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#161A46',
  },
  innerContainer: {
    // width: Dimensions.get('window').width - 30,
    flex: 1,
    // height: Dimensions.get('window').height - (Platform.OS === 'ios' ? 30 : 50),
    borderColor: '#FCDA80',
    borderWidth: 2,
    borderRadius: 20,
    margin: 15,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#00000050',
  },
  title: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
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
  AvatarContainer: {
    width: Dimensions.get('window').width - 90,
    alignItems: 'center',
  },
  avatarGrid: {
    marginVertical: 30,
    width: Dimensions.get('window').width - 90,
    height: Dimensions.get('window').width - 170,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  avatarImage: {
    width: (Dimensions.get('window').width - 60) / 3.5 - 40,
    height: (Dimensions.get('window').width - 60) / 3.5 - 40,
    resizeMode: 'cover',
  },
  activeSelection: {
    width: (Dimensions.get('window').width - 60) / 3.5 - 25,
    height: (Dimensions.get('window').width - 60) / 3.5 - 25,
    borderColor: '#FCDA80',
    borderWidth: 2,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Selection: {
    width: (Dimensions.get('window').width - 60) / 3.5 - 25,
    height: (Dimensions.get('window').width - 60) / 3.5 - 25,
    borderColor: '#FCDA8000',
    borderWidth: 2,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
