import axios from 'axios';

import {getCurrentUser, handleApiFail} from '../helpers/authHelper';
import {configs} from '../values/config';

export const getFavourites = async () => {
  const user = await getCurrentUser();
  return await axios
    .get(configs.BASE_URL + '/favourites', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
    .catch(handleApiFail);
};
