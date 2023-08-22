import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {Text, SafeAreaView, Pressable} from 'react-native';

const AppIntro = props => {
  const {navigation = () => null} = props;
  return (
    <SafeAreaView>
      <Text style={{color: '#000'}}>App Intro</Text>
      <Pressable
        onPress={() => {
          navigation?.jumpTo?.('App');
        }}>
        <Text style={{color: '#000'}}>open app</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default AppIntro;
