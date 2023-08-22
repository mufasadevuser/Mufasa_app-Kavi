import AsyncStorage from '@react-native-async-storage/async-storage';
let userState;

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@auth');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log(e);
  }
};

userState = getData();

export const authReducer = (state = userState, action) => {
  switch (action.type) {
    case 'LOGGED_IN_USER':
      return {...state, ...action.payload, isLoggedIn: true};
    case 'LOGOUT':
      return {...action.payload, isLoggedIn: false};
    default:
      return state;
  }
};
