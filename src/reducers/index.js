import {combineReducers} from 'redux';

import {authReducer} from './auth';
import {cityReducer} from './city';

const rootReducer = combineReducers({
  userAuth: authReducer,
  city: cityReducer,
});

export default rootReducer;
