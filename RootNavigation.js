import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
export const routeNameRef = createNavigationContainerRef();

export const navigate = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    navigationRef.goBack();
  }
};

export const toggleDrawer = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.toggleDrawer(name, params);
  } else {
    navigationRef.goBack();
  }
};
