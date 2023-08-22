let appState;

appState = null;

export const appConfsReducer = (state = appState, action) => {
  switch (action.type) {
    case 'CITY':
      return {...state, ...action.payload};
    default:
      return state;
  }
};
