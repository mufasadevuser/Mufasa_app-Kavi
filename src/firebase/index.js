import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {Platform} from 'react-native';

const androidCredentials = {
  appId: '1:889989888054:android:3a25979f56b0e678cdc097',
  apiKey: 'AIzaSyC6J8m469TEMJA5BzrLhIhs9dled-uRe34',
  messagingSenderId: '889989888054',
  projectId: 'mufasa-app-user',
  clientId:
    '889989888054-p8cqgeqrck0evinb8nv5n08q2jiiqjn2.apps.googleusercontent.com',
  storageBucket: 'mufasa-app-user.appspot.com',
  authDomain: 'mufasa-app-user.firebaseapp.com',
};

const iosCredentials = {
  appId: '1:889989888054:ios:dfadcfb9b99f27d6cdc097',
  apiKey: 'AIzaSyApirs56ZHhEVch0Xjx8hN91aQQG5uwlF4',
  messagingSenderId: '889989888054',
  projectId: 'mufasa-app-user',
  clientId:
    '889989888054-thb6b1ppol8kk892e5mndtaahd3qqan4.apps.googleusercontent.com',
  storageBucket: 'mufasa-app-user.appspot.com',
  authDomain: 'mufasa-app-user.firebaseapp.com',
};

const firebaseConfig = Platform.select({
  android: androidCredentials,
  ios: iosCredentials,
});

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default () => {
  return {firebase, auth};
};
