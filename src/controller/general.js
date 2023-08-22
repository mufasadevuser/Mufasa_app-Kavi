import axios from "axios";

import { configs } from "../values/config";

export const getDashboardParams = async () => {
  const response = await axios.get(`${configs.BASE_URL}/dashboard`);
  return response?.data ?? {};
};

/* {
    transformResponse: data => {
      const objectResponse = {};
      const parsedRes = JSON.parse(data);
      const objectKeys = Object.keys(parsedRes);
      _.forEach(objectKeys, key => {
        if (_.isArray(parsedRes[key])) {
          objectResponse[parsedRes[key]] = {};

          _.forEach(parsedRes[key], tag => {
            objectResponse[parsedRes[key]][tag] = true;
          });
        }
      });
    },
  } */
