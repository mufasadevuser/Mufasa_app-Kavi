import axios from "axios";

import { getCurrentUser, handleApiFail } from "../helpers/authHelper";
import { configs } from "../values/config";

export const getServices = async (city) => {
  const user = await getCurrentUser();
  console.log(configs.BASE_URL + "/services/" + city);
  console.log(user.token);
  return await axios
    .get(configs.BASE_URL + "/services/" + city, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
    .catch(handleApiFail);
};

export const searchServices = async (city, query) =>
  await axios.get(configs.BASE_URL + "/services/" + city + "/" + query);
