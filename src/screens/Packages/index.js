import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import _ from 'lodash';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {SquareLineDivider, Submit, Title} from '../../components';
import {ReservationModal} from '../../components/reservationModal';
import {configs} from '../../values/config';

export const PackageInfo = ({route, navigation}) => {
  const {
    vendorData,
    serviceType,
    selectedCategory,
    package: vendorPackage,
    index,
  } = route.params;
  const screenConfig = configs.SCREEN_CONFIG[selectedCategory];
  const {
    description,
    price: normalPrice,
    title,
    package_details,
    duration,
    prices,
  } = vendorPackage;

  const price = normalPrice || prices?.singleday?.[0]?.price;

  const [reserveBoxVisible, setReserveBoxVisible] = useState(false);
  const [city, setSelectedCity] = useState();

  const isEvent = serviceType === configs.VENDOR_TYPES.EVENT;
  const isService = serviceType === configs.VENDOR_TYPES.SERVICE;

  useEffect(() => {
    AsyncStorage.getItem('@city').then(city => {
      setSelectedCity(city);
    });
  }, []);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // const [time, setTime] = useState(new Date());
  const [date, setDate] = useState(new Date());

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View
        style={[styles.innerContainer, {backgroundColor: screenConfig.color}]}>
        <View style={styles.header}>
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
          <View style={styles.optionTitle}>
            <Text style={styles.optionTitleText}>{`PACKAGE ${index + 1}`}</Text>
            <Text style={styles.optionTitlePrice} numberOfLines={3}>
              {title}
            </Text>
          </View>
        </View>
        <View style={styles.divider}>
          <SquareLineDivider />
        </View>
        <View
          style={[styles.content, {backgroundColor: screenConfig.secColor}]}>
          <View style={styles.section}>
            <Title text="DATE" color="#FCDA80" />
            <View style={styles.pickerContainer}>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={date}
                  mode="date"
                  onChange={(event, date) => {
                    setDate(date);
                  }}
                  textColor="#fff"
                  themeVariant="dark"
                  dateFormat="day month year"
                  style={{width: 180, marginLeft: -60}}
                />
              ) : (
                <>
                  <Pressable
                    style={[
                      styles.button,
                      {
                        backgroundColor: screenConfig.color,
                      },
                    ]}
                    onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.buttonText}>
                      {moment(date).format('MMMM Do YYYY')}
                    </Text>
                  </Pressable>
                  <DateTimePickerModal
                    isVisible={showDatePicker}
                    date={date}
                    value={date}
                    minimumDate={new Date()}
                    maximumDate={moment().add(10, 'days').toDate()}
                    mode="date"
                    minuteInterval={30}
                    onChange={date => {
                      setDate(date);
                    }}
                    onConfirm={date => {
                      setDate(date);
                      setShowDatePicker(false);
                    }}
                    onCancel={() => setShowDatePicker(false)}
                  />
                </>
              )}
            </View>
          </View>
          {!isEvent && (
            <View style={styles.section}>
              <Title text="TIME" color="#FCDA80" />
              <View style={styles.pickerContainer}>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={date}
                    mode="time"
                    onChange={(event, date) => {
                      setDate(date);
                    }}
                    textColor="#fff"
                    themeVariant="dark"
                    style={{width: 96}}
                  />
                ) : (
                  <>
                    <Pressable
                      style={[
                        styles.button,
                        {
                          backgroundColor: screenConfig.color,
                        },
                      ]}
                      onPress={() => setShowTimePicker(true)}>
                      <Text style={styles.buttonText}>
                        {moment(date).format('h:mm a')}
                      </Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={showTimePicker}
                      date={date}
                      value={date}
                      mode="time"
                      onChange={date => {
                        setDate(date);
                      }}
                      onConfirm={date => {
                        setDate(date);
                        setShowTimePicker(false);
                      }}
                      onCancel={() => setShowTimePicker(false)}
                    />
                  </>
                )}
              </View>
            </View>
          )}
          {!_.isEmpty(description) ? (
            <View style={styles.section}>
              <Title text="DESCRIPTION" color="#FCDA80" />
              <Text>{description}</Text>
            </View>
          ) : null}
          {price ? (
            <View style={styles.section}>
              <Title text="PRICE" color="#FCDA80" />
              <Text style={styles.price}>{`${
                city === 'Goa' ? '₹' : ''
              } ${price}`}</Text>
            </View>
          ) : null}
          {isService && duration ? (
            <View style={styles.section}>
              <Title text="DURATION" color="#FCDA80" />
              <Text style={styles.details}>{duration}</Text>
            </View>
          ) : null}
          {!_.isEmpty(package_details) ? (
            <View style={styles.section}>
              <Title text="OTHER DETAILS" color="#FCDA80" />
              <View style={{marginTop: 6}}>
                {_.map(package_details, (pDetail, index) => {
                  return (
                    <Text key={index} style={styles.details}>
                      {pDetail}
                    </Text>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
        <View style={[styles.bottom, {backgroundColor: screenConfig.color}]}>
          <Submit
            label="NEXT"
            handleSubmit={() => setReserveBoxVisible(true)}
          />
        </View>
      </View>
      <ReservationModal
        vendorData={vendorData}
        visible={reserveBoxVisible}
        setVisible={setReserveBoxVisible}
        selectedOpt={vendorPackage}
        serviceType={serviceType}
        date={date}
        time={date}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    flex: 1,
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
  },
  header: {
    // height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    width: '100%',
  },
  optionTitle: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitleText: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    fontSize: 14,
    color: '#FCDA80',
    marginBottom: 16,
  },
  optionTitlePrice: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    color: '#FCDA80',
    textTransform: 'uppercase',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: '12%',
    textAlign: 'center',
  },
  divider: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backIcon: {
    top: 24,
    left: 20,
    position: 'absolute',
    zIndex: 1,
  },
  icons: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 7,
  },
  bottom: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  price: {
    color: '#FCDA80',
    fontSize: 18,
    fontFamily: configs.FONTS.PRIMARY_FONT,
  },
  details: {
    color: '#FCDA80',
    fontFamily: configs.FONTS.PRIMARY_FONT,
    textAlign: 'center',
  },
  section: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  pickerContainer: {
    marginTop: 12,
  },
  button: {
    width: 200,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: configs.COLORS.goldenRegular,
  },
  buttonText: {color: '#fff', fontFamily: configs.FONTS.PRIMARY_MEDIUM},
});
