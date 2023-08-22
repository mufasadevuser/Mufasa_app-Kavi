let cityState;

cityState = '';

export const cityReducer = (state = cityState, action) => {
  switch (action.type) {
    case 'CITY':
      return {...state, ...action.payload};
    default:
      return state;
  }
};
