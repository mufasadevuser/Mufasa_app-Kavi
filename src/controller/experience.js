import axios from 'axios';

import {getCurrentUser, handleApiFail} from '../helpers/authHelper';
import {configs} from '../values/config';

export const getActivities = async city => {
  const user = await getCurrentUser();
  return await axios
    .get(configs.BASE_URL + '/activities/' + city, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
    .catch(handleApiFail);
};

export const searchActivities = async (city, query) =>
  await axios.get(configs.BASE_URL + '/activities/' + city + '/' + query);

export const getHotels = async city =>
  await axios.get(configs.BASE_URL + '/hotels/' + city);

export const searchHotels = async (city, query) =>
  await axios.get(configs.BASE_URL + '/hotels/' + city + '/' + query);

export const bookActivity = async (token, data) =>
  await axios
    .post(`${configs.BASE_URL}/activities/reserve`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);

export const bookHotel = async (token, data) =>
  await axios
    .post(`${configs.BASE_URL}/hotels/reserve`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);
