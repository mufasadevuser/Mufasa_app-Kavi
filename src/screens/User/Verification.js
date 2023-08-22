import React, {useEffect} from 'react';
import {Modal, StyleSheet, TouchableHighlight, View} from 'react-native';
import {SimpleAnimation} from 'react-native-simple-animations';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {CopyRight, InputOTP, Submit, SubTitle, TitleQ} from '../../components';
import {configs} from '../../values/config';

const Verification = ({
  setCode,
  confirmCode,
  time,
  visible,
  setVisible,
  setTime,
  mobile,
  resend,
}) => {
  const handleSubmit = () => {
    confirmCode();
    setVisible(!visible);
  };

  return (
    <Modal
      style={{height: '100%', width: '100%'}}
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={() => setVisible(!visible)}>
      <SimpleAnimation
        aim="in"
        delay={700}
        duration={1000}
        animate
        animateOnUpdate={false}
        fade
        distance={200}
        direction="up">
        <View style={styles.modalOverlay} />
      </SimpleAnimation>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableHighlight
            style={styles.backArrow}
            onPress={() => setVisible(!visible)}>
            <FontAwesome5
              name="arrow-left"
              size={25}
              color={configs.COLORS.goldenRegular}
            />
          </TouchableHighlight>
          <TitleQ text="OTP" size={30} color={configs.COLORS.goldenRegular} />
        </View>
        <View>
          {time > 0 ? (
            <SubTitle
              text={`Send again in\n${time}`}
              align="center"
              color="#C2AC79"
            />
          ) : (
            <TouchableHighlight style={styles.sendAgain} onPress={resend}>
              <SubTitle align="center" text="Send Again" />
            </TouchableHighlight>
          )}
          <View style={{height: 8}} />
          <SubTitle
            size={16}
            align="center"
            color={configs.COLORS.goldenRegular}
            text={`We have sent the verification code to\n ${mobile}`}
          />
        </View>
        <View>
          <InputOTP label="Verification Code" setValue={setCode} />
          <Submit label="Submit" handleSubmit={handleSubmit} />
          <TouchableHighlight style={{marginVertical: 5}}>
            <SubTitle
              text="Entered incorrect number?"
              size={14}
              align="center"
            />
          </TouchableHighlight>
        </View>
        <CopyRight />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    height: '100%',
    width: '100%',
    backgroundColor: '#02040D',
    opacity: 0.95,
  },
  modalContainer: {
    width: '98%',
    height: '70%',
    position: 'absolute',
    justifyContent: 'space-between',
    alignSelf: 'center',
    bottom: 0,
    backgroundColor: configs.COLORS.darkBlue,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 30,
    shadowRadius: 5,
    shadowOpacity: 1,
    shadowOffset: {width: 0, height: -10},
    shadowColor: '#000',
    elevation: 50,
  },
  modalImage: {
    resizeMode: 'cover',
  },
  modalHeader: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  backArrow: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
    height: 30,
    width: 30,
  },
  sendAgain: {
    width: 150,
    alignSelf: 'center',
    padding: 5,
    marginBottom: 10,
    backgroundColor: configs.COLORS.goldenDark,
    borderRadius: 5,
  },
});

export default Verification;
