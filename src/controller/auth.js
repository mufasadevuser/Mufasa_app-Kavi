import axios from 'axios';

import {getCurrentUser, handleApiFail} from '../helpers/authHelper';
import {configs} from '../values/config';

export const register = async user =>
  await axios.post(configs.BASE_URL + '/register', user);

export const login = async user =>
  await axios.post(configs.BASE_URL + '/login', user);

export const setProfilePic = async (token, data, id) =>
  await axios
    .put(`${configs.BASE_URL}/profile/picture/update/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);

export const getProfilePic = async id =>
  await axios.get(`${configs.BASE_URL}/profile/picture/${id}`);

export const addFavourite = async (token, data, id) =>
  await axios
    .put(`${configs.BASE_URL}/profile/favourites/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);

export const allBookings = async (token, id) =>
  axios
    .get(`${configs.BASE_URL}/profile/bookings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);

export const cancelBooking = async (token, id) =>
  axios
    .put(`${configs.BASE_URL}/profile/bookings/cancel/${id}`, undefined, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);

export const toggleFavourite = async (token, resource_type, resource_id) =>
  axios
    .put(`${configs.BASE_URL}/favourite`, undefined, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        resource_type,
        resource_id,
      },
    })
    .catch(handleApiFail);

export const addRating = async (resource_type, resource_id, rating) => {
  const user = await getCurrentUser();
  axios
    .put(`${configs.BASE_URL}/rate`, undefined, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      params: {
        resource_type,
        resource_id,
        rating,
      },
    })
    .catch(handleApiFail);
};

export const deleteUserAccount = async () => {
  const user = await getCurrentUser();
  axios
    .put(`${configs.BASE_URL}/account/delete`, undefined, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
    .catch(handleApiFail);
};

export const setDisplayName = async ({token, displayName = ''}) =>
  await axios
    .put(
      `${configs.BASE_URL}/profile/name/update?newDisplayName=${displayName}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .catch(handleApiFail);
