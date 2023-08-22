/**
 * @format
 */

import {AppRegistry, Platform, StatusBar} from 'react-native';

import App from './App';
import {name as appName} from './app.json';

if (Platform.OS === 'android') {
  StatusBar.setBackgroundColor('#fff');
  StatusBar.setBarStyle('dark-content');
}

AppRegistry.registerComponent(appName, () => App);
