import axios from "axios";

import { getCurrentUser, handleApiFail } from "../helpers/authHelper";
import { configs } from "../values/config";

export const getRestos = async (city) => {
  const user = await getCurrentUser();
  console.log(user.token);
  return await axios
    .get(configs.BASE_URL + "/restaurants/" + city, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
    .catch(handleApiFail);
};

export const searchRestos = async (city, query) =>
  await axios.get(configs.BASE_URL + "/restaurants/" + city + "/" + query);

export const getClubs = async (city) => {
  const user = await getCurrentUser();
  console.log(user.token);
  return await axios
    .get(configs.BASE_URL + "/clubs/" + city, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
    .catch(handleApiFail);
};

export const searchClubs = async (city, query) =>
  await axios.get(configs.BASE_URL + "/clubs/" + city + "/" + query);

export const getEvents = async (city) => {
  const user = await getCurrentUser();
  return await axios
    .get(configs.BASE_URL + "/events/" + city, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
    .catch(handleApiFail);
};
export const searchEvents = async (city, query) =>
  await axios.get(configs.BASE_URL + "/events/" + city + "/" + query);

export const bookClub = async (token, data) => {
  await axios
    .post(`${configs.BASE_URL}/clubs/reserve`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);
};

export const bookEvent = async (token, data) =>
  await axios
    .post(`${configs.BASE_URL}/events/reserve`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);

export const bookResto = async (token, data) =>
  await axios
    .post(`${configs.BASE_URL}/restaurants/reserve`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);

export const bookService = async (token, data) =>
  await axios
    .post(`${configs.BASE_URL}/services/reserve`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(handleApiFail);
