import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {TitleQ} from '../../components';
import {ReservationCard} from '../../components/cards';
import {allBookings} from '../../controller/auth';
import {configs} from '../../values/config';

const Bookings = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsNew, setBookingsNew] = useState({
    upcoming: [],
    completed: [],
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    loadUserBookings();
    if (!loading) {
      loadAgain();
    } else {
      setRefreshing(false);
    }
  };

  const loadUserBookings = async () => {
    const auth = await AsyncStorage.getItem('@auth');
    const u = JSON.parse(auth);
    try {
      const {data} = await allBookings(u.token, u.user._id);
      setBookings(data);
      setLoading(false);
      const upComingBookings = [];
      const completedBookings = [];
      const allBs = bookings;
      allBs.sort(
        (a, b) =>
          moment(a.booking_info?.date, 'Do MMM YYYY').format('YYYYMMDD') -
          new moment(b.booking_info?.date, 'Do MMM YYYY').format('YYYYMMDD'),
      );
      for (let i = 0; i < allBs?.length; i++) {
        if (
          moment(allBs[i].booking_info?.date, 'Do MMM YYYY').format(
            'YYYYMMDD',
          ) >= moment(new Date()).format('YYYYMMDD')
        ) {
          upComingBookings.push(allBs[i]);
        } else {
          completedBookings.push(allBs[i]);
        }
      }
      setBookingsNew({
        upcoming: upComingBookings,
        completed: completedBookings,
      });
      setRefreshing(false);
    } catch (err) {
      console.log(err);
    }
  };

  const loadAgain = () => {
    const upComingBookings = [];
    const completedBookings = [];
    const allBs = bookings;
    allBs.sort(
      (a, b) =>
        moment(a.booking_info?.date, 'Do MMM YYYY').format('YYYYMMDD') -
        new moment(b.booking_info?.date, 'Do MMM YYYY').format('YYYYMMDD'),
    );
    for (let i = 0; i < allBs?.length; i++) {
      if (
        moment(allBs[i].booking_info?.date, 'Do MMM YYYY').format('YYYYMMDD') >=
        moment(new Date()).format('YYYYMMDD')
      ) {
        upComingBookings.push(allBs[i]);
      } else {
        completedBookings.push(allBs[i]);
      }
    }
    setBookingsNew({
      upcoming: upComingBookings,
      completed: completedBookings,
    });
  };

  useEffect(() => {
    loadUserBookings();
    if (!loading) {
      loadAgain();
    }
  }, [loading]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.logoToggleBar}>
            <Image
              style={styles.logoIcon}
              source={require('../../../assets/images/icons/logoIcon.png')}
            />
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
            <TouchableOpacity
              underlayColor="#00000010"
              onPress={() => navigation.toggleDrawer()}
              style={styles.sidebarToggle}>
              <Image
                style={styles.toggleIcon}
                source={require('../../../assets/images/icons/toggleIcon.png')}
              />
            </TouchableOpacity>
          </View>
          <TitleQ text="Your Reservations" size={25} color="#FCDA80" />
        </View>
        {bookingsNew?.upcoming?.length === 0 &&
        bookingsNew?.completed?.length === 0 ? (
          loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{
                flex: 1,
                width: '100%',
                justifyContent: 'center',
                backgroundColor: '#FCDA80dd',
              }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              <Text style={styles.noReservationText}>
                Any bookings you make through the Mufasa app will appear here
              </Text>
            </ScrollView>
          )
        ) : (
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {!refreshing && bookingsNew?.upcoming?.length > 0 && (
              <Text style={styles.innerTitle}>Upcoming Reservations</Text>
            )}

            {!refreshing &&
              bookingsNew?.upcoming?.map(book => (
                <ReservationCard
                  reservation={book}
                  refreshBookings={onRefresh}
                />
              ))}

            {!refreshing && bookingsNew?.completed?.length > 0 && (
              <Text style={[styles.innerTitle, {marginTop: 24}]}>
                Completed Reservations
              </Text>
            )}

            {!refreshing &&
              bookingsNew?.completed?.map(book => (
                <ReservationCard
                  completed
                  reservation={book}
                  refreshBookings={onRefresh}
                />
              ))}
            <View style={{height: 20, width: '100%'}} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  innerContainer: {
    borderColor: '#FCDA80',
    borderWidth: 2,
    borderRadius: 20,
    margin: 15,
    alignItems: 'center',
    overflow: 'hidden',
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  logoToggleBar: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarToggle: {
    width: 30,
    height: 30,
    right: 15,
    top: 0,
    position: 'absolute',
  },
  toggleIcon: {
    width: '100%',
    resizeMode: 'contain',
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
  logoIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  scrollContainer: {
    width: '100%',
    paddingTop: 10,
    backgroundColor: '#FCDA80',
  },
  innerTitle: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    paddingVertical: 5,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noReservationText: {
    fontFamily: configs.FONTS.PRIMARY_FONT,
    paddingVertical: 5,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: '#ffffff10',
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 24,
  },
});

export default Bookings;
