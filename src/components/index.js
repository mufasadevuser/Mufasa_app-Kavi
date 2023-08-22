import _ from 'lodash';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';
import OtpInputs from 'react-native-otp-inputs';
import PhoneInput from 'react-native-phone-number-input';
import {SimpleAnimation} from 'react-native-simple-animations';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {configs} from '../values/config';

//copyright
export const CopyRight = () => (
  <Text
    style={{
      color: configs.COLORS.goldenRegular,
      fontSize: 14,
      fontFamily: configs.FONTS.PRIMARY_MEDIUM,
      textAlign: 'center',
    }}>
    {configs.STRINGS.copyright}
  </Text>
);

// Title - Montserrat Font
export const Title = ({text, size, color}) => (
  <Text
    style={{
      color,
      fontSize: size,
      fontFamily: configs.FONTS.PRIMARY_MEDIUM,
    }}>
    {text}
  </Text>
);

// SubTitle - Montserrat Font
export const SubTitle = ({text, size, color, align}) => (
  <Text
    style={{
      color,
      fontSize: size,
      fontFamily: configs.FONTS.PRIMARY_FONT,
      textAlign: align,
    }}>
    {text}
  </Text>
);

// Title - Quantify Font
export const TitleQ = ({text, size, color, align}) => (
  <Text
    style={{
      color,
      fontSize: size,
      fontFamily: configs.FONTS.SECONDARY_FONT,
      fontWeight: '600',
      textAlign: align,
    }}>
    {text}
  </Text>
);

// Text Input
export const InputText = ({
  label,
  value,
  setValue,
  align,
  placeholder,
  color,
  maxLength,
}) => (
  <View style={styles.inputContainer}>
    <Text
      style={{
        color: color ?? configs.COLORS.whitePrimary,
        marginBottom: 5,
        fontFamily: configs.FONTS.PRIMARY_FONT,
        fontSize: 13,
        textAlign: align,
        width: '100%',
      }}>
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={setValue}
      placeholder={placeholder}
      style={{
        width: '100%',
        height: 50,
        backgroundColor: configs.COLORS.inputBackground,
        fontFamily: configs.FONTS.PRIMARY_FONT,
        borderRadius: 5,
        textAlign: align,
        paddingLeft: align == 'center' ? 0 : 10,
        color: color ?? configs.COLORS.whitePrimary,
      }}
      maxLength={maxLength}
    />
  </View>
);

// Text Input
export const InputNumber = ({
  label,
  value,
  setValue,
  align,
  placeholder,
  color,
  max,
}) => (
  <View style={styles.inputContainer}>
    <Text
      style={{
        color: color ?? configs.COLORS.whitePrimary,
        marginBottom: 5,
        fontFamily: configs.FONTS.PRIMARY_FONT,
        fontSize: 13,
        width: '100%',
      }}>
      {label}
    </Text>
    <TextInput
      value={value}
      maxLength={max}
      onChangeText={setValue}
      placeholder={placeholder}
      keyboardType="numeric"
      style={{
        width: '100%',
        height: 50,
        backgroundColor: configs.COLORS.inputBackground,
        fontFamily: configs.FONTS.PRIMARY_FONT,
        borderRadius: 5,
        textAlign: align,
        paddingLeft: align == 'center' ? 0 : 10,
        color: color ?? configs.COLORS.whitePrimary,
      }}
    />
  </View>
);

export const CW = props => (
  <View style={{width: props.width}}>{props.children}</View>
);

export const CloseCircle = ({handleClose, style}) => (
  <TouchableOpacity
    onPress={() => handleClose}
    style={{...styles.closeBtn, ...style}}>
    <FontAwesome5 name="times-circle" size={20} />
  </TouchableOpacity>
);

export const ItemPicker = ({
  label,
  value,
  items,
  setValue,
  color,
  placeholder,
  open,
  setOpen,
}) => {
  return (
    <View style={styles.inputContainer}>
      {!_.isEmpty(label) && (
        <Text
          style={{
            color: color ? color : configs.COLORS.whitePrimary,
            marginBottom: 5,
            fontFamily: configs.FONTS.PRIMARY_FONT,
            fontSize: 13,
            width: '100%',
          }}>
          {label}
        </Text>
      )}
      <DropDownPicker
        dropDownContainerStyle={{
          backgroundColor: '#fff',
          borderColor: '#00000000',
        }}
        placeholder={placeholder}
        listItemLabelStyle={{
          color: '#000',
        }}
        dropDownDirection="BOTTOM"
        textStyle={{color: '#fff'}}
        autoScroll
        style={{backgroundColor: '#ffffff20', borderColor: '#00000000'}}
        open={open}
        setOpen={setOpen}
        value={value}
        setValue={setValue}
        items={items}
      />
    </View>
  );
};

//Date
export const DateInput = ({label, setValue, color, align, placeholder}) => {
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  return (
    <View style={styles.inputContainer}>
      <View style={styles.dateContainer}>
        <CW width="25%">
          <InputNumber
            value={day}
            setValue={setDay}
            label="Date"
            align="center"
            max={2}
          />
        </CW>
        <View style={styles.dateSquareLineSquare} />
        <CW width="25%">
          <InputNumber
            value={month}
            setValue={setMonth}
            label="Month"
            align="center"
            max={2}
          />
        </CW>
        <View style={styles.dateSquareLineSquare} />
        <CW width="35%">
          <InputNumber
            value={year}
            setValue={setYear}
            label="Year"
            align="center"
            max={4}
          />
        </CW>
      </View>
    </View>
  );
};

// Phone Input
export const InputPhone = ({
  label,
  value,
  setValue,
  setFormattedValue,
  loader,
  verified,
}) => {
  return (
    <View style={styles.inputContainer}>
      <SimpleAnimation
        aim="in"
        delay={1300}
        duration={1000}
        animate
        animateOnUpdate={false}
        movementType="slide"
        distance={20}
        direction="up">
        <Text style={styles.inputLabel}>{label}</Text>
      </SimpleAnimation>
      <PhoneInput
        value={value}
        onChangeText={text => setValue(text)}
        onChangeFormattedText={text => setFormattedValue(text)}
        layout="second"
        containerStyle={styles.inputField}
        textInputStyle={styles.textInputField}
        codeTextStyle={styles.textInputFieldLabel}
        textInputProps={{maxLength: 10, selectionColor: '#fff'}}
        countryPickerButtonStyle={styles.countryPickerStyle}
        textContainerStyle={{backgroundColor: 'transparent'}}
        placeholder="Mobile Number"
      />
      {loader && (
        <ActivityIndicator
          style={{
            position: 'absolute',
            right: 15,
            top: 40,
          }}
          size={20}
          color={configs.COLORS.goldenRegular}
        />
      )}
      {verified && (
        <FontAwesome5
          style={{
            position: 'absolute',
            right: 15,
            top: 40,
          }}
          name="check"
          size={20}
          color={configs.COLORS.verifiedGreen}
        />
      )}
    </View>
  );
};

//OTP Field
export const InputOTP = ({label, setValue}) => {
  return (
    <View style={styles.otpContainer}>
      <Text style={styles.otpLabel}>{label}</Text>
      <OtpInputs
        handleChange={code => setValue(code)}
        numberOfInputs={6}
        style={styles.otpField}
        inputStyles={styles.otpFields}
        autofillFromClipboard
        autofillListenerIntervalMS={100000}
      />
    </View>
  );
};

//Submit Button
export const Submit = ({label, handleSubmit}) => {
  return (
    <TouchableHighlight style={styles.submit} onPress={handleSubmit}>
      <LinearGradient
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={styles.submitContainer}
        colors={[configs.COLORS.goldenLight, configs.COLORS.goldenDark]}>
        <Text style={styles.submitText}>{label}</Text>
      </LinearGradient>
    </TouchableHighlight>
  );
};

//Google Button
export const GoogleButton = ({handleSubmit, loader}) => {
  return (
    <TouchableHighlight
      style={styles.googleSubmit}
      onPress={() => {
        handleSubmit();
      }}>
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.googleSubmitContainer}
        colors={[configs.COLORS.whitePrimary, configs.COLORS.whiteAccent]}>
        <Image
          style={styles.googleIcon}
          source={require('../../assets/images/icons/google.png')}
        />
        <Text style={styles.googleSubmitText}>Sign in with Google</Text>
        {loader && (
          <ActivityIndicator
            style={{
              left: 10,
            }}
            size={25}
            color={configs.COLORS.darkBlue}
          />
        )}
      </LinearGradient>
    </TouchableHighlight>
  );
};

//divider text
export const Divider = ({label}) => {
  const dividerLine = {
    width: (Dimensions.get('screen').width - (label.length * 15 + 4)) / 2,
    height: 2,
    backgroundColor: configs.COLORS.whiteAccent,
    borderRadius: 5,
  };
  return (
    <View style={styles.dividerContainer}>
      <View style={dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={dividerLine} />
    </View>
  );
};

//squareline
export const SquareLineDivider = () => (
  <View style={styles.squareLineContainer}>
    <View style={styles.squareLineSquare} />
    <View style={styles.squareLine} />
    <View style={styles.squareLineSquare} />
  </View>
);

//stylesheet
const styles = StyleSheet.create({
  //PHONE NUMBER INPUT
  inputContainer: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  inputLabel: {
    color: configs.COLORS.whitePrimary,
    marginBottom: 5,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontSize: 13,
  },
  inputField: {
    width: '100%',
    height: 50,
    backgroundColor: configs.COLORS.inputBackground,
    borderRadius: 5,
  },
  textInputField: {
    height: 50,
    letterSpacing: 3,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    backgroundColor: 'transparent',
    color: configs.COLORS.whitePrimary,
    fontSize: 14,
  },
  textInputFieldLabel: {
    height: 25,
    textAlign: 'left',
    color: configs.COLORS.whitePrimary,
    letterSpacing: 3,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontSize: 15,
    marginLeft: 10,
  },
  countryPickerStyle: {
    width: '20%',
  },

  //SUBMIT BUTTON
  submitContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: configs.COLORS.whitePrimary,
    fontFamily: configs.FONTS.PRIMARY_MEDIUM,
    fontSize: 17,
  },
  submit: {
    height: 50,
    width: '100%',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  //Google BUTTON
  googleSubmitContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  googleSubmitText: {
    color: configs.COLORS.darkBlue,
    fontFamily: configs.FONTS.PRIMARY_MEDIUM,
    fontSize: 17,
  },
  googleSubmit: {
    height: 50,
    width: '100%',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    height: 30,
    width: 30,
    marginRight: 10,
  },

  //DIVIDER
  dividerContainer: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10,
  },
  dividerLabel: {
    fontFamily: configs.FONTS.PRIMARY_MEDIUM,
    fontSize: 12,
    color: configs.COLORS.whitePrimary,
  },

  //OTP Box
  otpContainer: {
    width: '100%',
  },
  otpField: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  otpFields: {
    backgroundColor: configs.COLORS.inputBackground,
    width: 45,
    height: 50,
    textAlign: 'center',
    borderRadius: 5,
    color: '#fff',
  },
  otpLabel: {
    color: configs.COLORS.whitePrimary,
    marginBottom: 10,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontSize: 13,
    textAlign: 'center',
  },
  squareLineContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 5,
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
  dateContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSquareLineSquare: {
    width: 7,
    height: 7,
    transform: [{rotate: '45deg'}],
    borderColor: '#FCDA80D0',
    borderWidth: 0.8,
    top: 10,
  },
  closeBtn: {
    borderRadius: 40,
    height: 20,
    width: 20,
  },
});
