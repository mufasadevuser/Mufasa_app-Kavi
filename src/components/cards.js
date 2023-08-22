import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {cancelBooking} from '../controller/auth';
import {configs} from '../values/config';
import {Carousel} from './carousel';

export const VendorCard = ({
  vendorData,
  navigation,
  serviceType,
  selectedCategory,
}) => {
  const {ratings, avg_rating} = vendorData;
  const isEvent = serviceType === configs.VENDOR_TYPES.EVENT;
  const rating = ratings?.rating ?? avg_rating ?? 0;

  const onPress = useCallback(() => {
    navigation.navigate('VendorInfo', {
      vendorData,
      serviceType,
      selectedCategory,
    });
  }, [vendorData, serviceType, selectedCategory]);

  return (
    <Pressable onPress={onPress}>
      <View style={styles.cardContainer}>
        {vendorData.images?.length ? (
          <Carousel
            data={vendorData.images}
            renderItem={({index, item}) => (
              <View key={index} style={[styles.cardSlider]}>
                <Image source={{uri: item}} style={styles.cardImage} />
              </View>
            )}
            style={{width: Dimensions.get('window').width - 64}}
          />
        ) : (
          <Pressable onPress={onPress}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={{
                width: '100%',
                height: 200,
              }}
              resizeMode="contain"
            />
          </Pressable>
        )}
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.cardInfoContainer}
          colors={['#00000000', '#000000F0']}>
          <Pressable onPress={onPress}>
            <Text style={styles.cardTitle}>
              {vendorData.general_information.name ?? vendorData.name}
            </Text>
            <View style={styles.row}>
              <FontAwesome5
                name="map-marker-alt"
                size={14}
                color={configs.COLORS.whitePrimary}
              />
              <Text style={styles.smallText} numberOfLines={1}>
                {vendorData.general_information.address ?? vendorData.address}
              </Text>
            </View>
            {isEvent ? (
              <View style={styles.row}>
                <FontAwesome5
                  name="calendar-day"
                  size={10}
                  color={configs.COLORS.whitePrimary}
                />
                <Text style={styles.smallText} numberOfLines={1}>
                  {moment
                    .unix(vendorData.event_start_date)
                    .format('Do MMM YYYY')}{' '}
                  : {vendorData.start_time % 12}{' '}
                  {vendorData.start_time >= 12 ? 'PM' : 'AM'}
                </Text>
              </View>
            ) : (
              <View style={{width: 40, marginVertical: 3}}>
                <StarRating
                  disabled
                  maxStars={5}
                  rating={rating}
                  fullStarColor="#FCDA80"
                  starSize={14}
                  starStyle={{marginRight: 2}}
                />
              </View>
            )}
          </Pressable>
        </LinearGradient>
      </View>
    </Pressable>
  );
};

export const ReservationCard = ({reservation, completed, refreshBookings}) => {
  const [isCancelled, setIsCancelled] = useState(
    reservation?.cancelled ?? false,
  );

  const handleCancel = async () => {
    try {
      setIsCancelled(true);
      const auth = await AsyncStorage.getItem('@auth');
      const u = JSON.parse(auth);
      await cancelBooking(u.token, reservation._id);
    } catch (e) {
    } finally {
      refreshBookings?.();
    }
  };

  const name =
    reservation?.[reservation?.type?.toLowerCase()]?.general_information?.name;

  return (
    <View style={styles.reservationCardContainer}>
      <View style={styles.cardResTitle}>
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            padding: 4,
            fontSize: 10,
          }}>
          {reservation?.type?.toUpperCase()}
        </Text>
        {name && <Text style={styles.cardTitleText}>{name}</Text>}
      </View>

      <View
        style={{
          flexDirection: 'row',
          padding: 12,
          marginTop: 4,
          backgroundColor: '#1B342FD0',
        }}>
        <View style={styles.bookingInfoContainer}>
          <View style={styles.leftContainer}>
            <View style={styles.dataContainer}>
              <Text style={styles.bookingInfoTitle}>Name</Text>
              <Text style={styles.bookingInfoText}>
                {reservation?.booking_info?.guestName}
              </Text>
            </View>

            <View style={styles.dataContainer}>
              {reservation.type !== 'Club' &&
                reservation?.booking_info?.guestCount > 0 && (
                  <>
                    <Text style={styles.bookingInfoTitle}>Guests</Text>
                    <Text style={styles.bookingInfoText}>
                      {reservation?.booking_info?.guestCount}
                    </Text>
                  </>
                )}
            </View>

            <View style={styles.dataContainer}>
              <Text style={styles.bookingInfoTitle}>Date</Text>
              <Text style={styles.bookingInfoText}>
                {moment(reservation?.booking_info?.date).format('Do MMM YYYY')}
              </Text>
            </View>

            <View style={styles.dataContainer}>
              <Text style={styles.bookingInfoTitle}>Time</Text>
              <Text style={styles.bookingInfoText}>
                {moment(reservation?.booking_info?.time).format('hh:mm A')}
              </Text>
            </View>

            <View>
              <Text style={styles.bookingInfoText}>
                {reservation?.type === 'Club' ? 'Package' : 'Spl. Request'}
              </Text>
              {/* <Text style={styles.bookingInfoText}>
                {reservation?.booking_info?.time}
              </Text> */}
            </View>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          {isCancelled && completed ? (
            <View style={{...styles.confirmBox, backgroundColor: '#7a7a7a'}}>
              <Text style={styles.confirmText}>Completed</Text>
            </View>
          ) : (
            <>
              <View
                style={{
                  ...styles.confirmBox,
                  backgroundColor: reservation?.confirmed
                    ? '#00a146'
                    : isCancelled
                    ? '#7a7a7a'
                    : '#4285f4',
                }}>
                <Text style={styles.confirmText}>
                  {reservation?.confirmed
                    ? 'Confirmed'
                    : isCancelled
                    ? 'Cancelled'
                    : 'Pending'}
                </Text>
              </View>
              {!reservation?.confirmed && !isCancelled ? (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() =>
                    Alert.alert(
                      'Confirm Cancellation?',
                      'Please confirm if you want to cancel this reservation!',
                      [
                        {
                          text: 'Back',
                          onPress: () => console.log('Cancel Pressed'),
                          style: 'cancel',
                        },
                        {text: 'Confirm', onPress: () => handleCancel()},
                      ],
                    )
                  }>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: Dimensions.get('window').width - 64,
    height: 180,
    overflow: 'hidden',
    marginBottom: 12,
    borderRadius: 15,
    borderWidth: 1,
    alignSelf: 'center',
    borderColor: '#FCDA80',
  },
  wrapper: {
    backgroundColor: '#000',
    height: 200,
  },
  cardSlider: {
    width: Dimensions.get('window').width - 64,
    height: 200,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: Dimensions.get('window').width - 64,
    height: 200,
    resizeMode: 'cover',
  },
  cardInfoContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  cardTitle: {
    fontFamily: configs.FONTS.SECONDARY_FONT,
    color: configs.COLORS.whitePrimary,
    fontSize: 18,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
    marginBottom: 4,
  },
  smallText: {
    marginLeft: 10,
    fontFamily: configs.FONTS.PRIMARY_FONT,
    color: configs.COLORS.whitePrimary,
    fontSize: 12,
  },
  reservationCardContainer: {
    width: Dimensions.get('window').width - 60,
    borderWidth: 1,
    alignSelf: 'center',
    borderColor: '#FCDA80',
    marginVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardResTitle: {
    width: '100%',
    backgroundColor: '#1B342F',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  cardTitleText: {
    fontSize: 16,
    fontFamily: configs.FONTS.SECONDARY_FONT,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  confirmBox: {
    width: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  confirmText: {
    fontSize: 13,
    fontFamily: configs.FONTS.PRIMARY_MEDIUM,
    color: configs.COLORS.whitePrimary,
  },
  bookingInfoContainer: {
    padding: 10,
    flexDirection: 'row',
    flex: 1,
  },
  bookingInfoText: {
    color: '#fff',
    fontFamily: configs.FONTS.PRIMARY_FONT,
    lineHeight: 18,
  },
  bookingInfoTitle: {
    color: '#fff',
    fontFamily: configs.FONTS.PRIMARY_MEDIUM,
    width: 60,
  },
  leftContainer: {
    // width: '35%',
    flex: 2,
  },
  rightContainer: {
    // width: '65%',
    flex: 4,
  },
  bottomContainer: {
    // justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fea116',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: 80,
    paddingVertical: 8,
    marginTop: 4,
  },
  cancelText: {
    color: '#ffffff',
    fontFamily: configs.FONTS.PRIMARY_MEDIUM,
  },
  dataContainer: {flexDirection: 'row', marginBottom: 4},
});
