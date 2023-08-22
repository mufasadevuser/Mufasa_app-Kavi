import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Alert, Pressable, Text, View} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {cancelBooking} from '../controller/auth';
import {configs} from '../values/config';

const ReservationCard = props => {
  const {reservationInfo = {}, reloadBookings = () => null} = props;
  const [category, setCategory] = useState('EXQUISITE');

  const [isCancelled, setIsCancelled] = useState(
    reservationInfo?.cancelled ?? false,
  );

  const {
    club = null,
    restaurant = null,
    activity = null,
    service = null,
    booking_info = {},
  } = reservationInfo;

  const dataToRender = club ?? restaurant ?? activity ?? service;

  const {general_information} = dataToRender;

  const orderStatus = reservationInfo?.cancelled
    ? 'CANCELLED'
    : moment(booking_info?.date).isSame(new Date())
    ? 'ACTIVE'
    : moment(booking_info?.date).isBefore(new Date())
    ? null
    : reservationInfo?.confirmed
    ? 'CONFIRMED'
    : 'PENDING';

  useEffect(() => {
    if (club || restaurant) {
      setCategory('EXQUISITE');
    } else if (activity) {
      setCategory('EXPERIENCE');
    } else if (service) {
      setCategory('SERVICE');
    }
  }, []);

  const handleCancel = async () => {
    try {
      setIsCancelled(true);
      const auth = await AsyncStorage.getItem('@auth');
      const u = JSON.parse(auth);
      await cancelBooking(u.token, reservationInfo._id);
    } catch (e) {
    } finally {
      reloadBookings?.();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        marginBottom: 12,
        borderRadius: 8,
        elevation: 4,
        backgroundColor: '#efefef',
        shadowColor: 'black',
        shadowOffset: {height: 2, width: 0},
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}>
      <View
        style={{
          padding: 16,
          backgroundColor: '#fff',
          borderRadius: 8,
          elevation: 4,
          shadowColor: 'black',
          shadowOffset: {height: 2, width: 0},
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }}>
        <View
          style={{
            borderRadius: 3,
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor:
              configs?.SCREEN_CONFIG?.[category?.toUpperCase()]?.categoryColor,
            marginBottom: 16,
          }}>
          <Text
            style={{
              fontWeight: '500',
              fontSize: 14,

              color: '#fff',
            }}>
            {reservationInfo?.type}
          </Text>
        </View>
        <Text style={{fontWeight: '600', fontSize: 16, marginBottom: 8}}>
          {general_information?.name}
        </Text>
        <Text style={{fontWeight: '500', fontSize: 12, marginBottom: 8}}>
          {general_information?.location}
        </Text>
        <Text style={{fontWeight: '500', fontSize: 12}}>
          Booking id: {reservationInfo?._id}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 16,
            alignItems: 'center',
          }}>
          <View>
            <Text style={{fontWeight: '500', fontSize: 12}}>
              <FontAwesome5 name="calendar" size={12} color="#181818" />
              {`   ${moment(booking_info?.date).format('DD-MM-YYYY')}  ${moment(
                booking_info?.date,
              ).format('hh:mm A')}`}
            </Text>
          </View>

          <View
            style={{
              borderRadius: 3,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
              paddingVertical: 2,
              backgroundColor:
                configs.ORDER_STATUS_COLORS[orderStatus?.toUpperCase?.()]
                  ?.color,
            }}>
            <Text style={{fontSize: 11, fontWeight: '700'}}>
              {orderStatus?.toUpperCase?.()}
            </Text>
          </View>

          {!_.isEmpty(booking_info?.guestCount) && (
            <View
              style={{
                position: 'absolute',
                right: 0,
                top: -24,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                }}>
                <FontAwesome5 name="user" size={14} color="#181818" />
                {'  '}
                {booking_info?.guestCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {!reservationInfo?.confirmed && !isCancelled && (
        <Pressable
          onPress={() =>
            Alert.alert(
              'Cancel Booking',
              'Are you sure you want to cancel your booking?',
              [
                {
                  text: 'No',
                  onPress: () => null,
                },
                {text: 'Confirm', onPress: () => handleCancel()},
              ],
              {cancelable: true},
            )
          }
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
          }}>
          <Text
            style={{
              color:
                configs?.SCREEN_CONFIG?.[category?.toUpperCase()]
                  ?.categoryColor,
            }}>
            Cancel Booking{'  '}
          </Text>
          <FontAwesome5
            name="exclamation-circle"
            size={12}
            color={
              configs?.SCREEN_CONFIG?.[category?.toUpperCase()]?.categoryColor
            }
          />
        </Pressable>
      )}
    </View>
  );
};

export {ReservationCard};
