import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';

export const makePayment = async ({city, amount, user, orderId, currency}) => {
  const options = {
    orderId,
    description: 'Credits towards consultation',
    image:
      'https://static.wixstatic.com/media/563dcf_d35e751f78f84a7a95eec98e1f0d631a~mv2.png/v1/fill/w_128,h_88,al_c,usm_0.66_1.00_0.01,enc_auto/Untitled.png',
    currency,
    key: 'rzp_live_91ooh0RXafK0Rr', //'rzp_live_91ooh0RXafK0Rr', //'rzp_test_7p4eTNIHziwew3'
    amount, //parseInt(amount.replace(/,/g, ''), 10),
    name: 'Mufasa Global',
    prefill: {
      contact: user.contact,
      name: user.displayName,
    },
    theme: {color: '#F37254'},
  };
  try {
    const data = await RazorpayCheckout.open(options);
    console.log(data);
    AsyncStorage.setItem('@payment', data.razorpay_payment_id);
  } catch (error) {
    console.log(error);
    return false;
  }
};
