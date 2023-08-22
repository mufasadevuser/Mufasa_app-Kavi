import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';

import * as RootNavigation from '../../RootNavigation';
import firebaseSetup from '../firebase/';

export const getCurrentUser = async () => {
  const auth = await AsyncStorage.getItem('@auth');
  const u = JSON.parse(auth);
  return u;
};

export const handleApiFail = async error => {
  switch (error?.response?.status) {
    case 401: {
      const {auth} = firebaseSetup();

      await AsyncStorage.multiRemove(['@auth', '@firstTime']);
      await auth?.().signOut?.();

      RootNavigation.navigate('Login');
      Toast.show('Session expired, please login.');
    }
  }
};
