import analytics from "@react-native-firebase/analytics";
import appsFlyer from "react-native-appsflyer";
import { AppEventsLogger } from "react-native-fbsdk";

export let globalScreenName = "";
export const trackEventNormal = async (eventName) => {
  await analytics().logEvent(eventName, {});
};

export const trackEventNormalWithParams = async (eventName, params) => {
  await analytics().logEvent(eventName, params);
  AppEventsLogger.logEvent(eventName, "", params);
};

export const trackScreen = async (screenName) => {
  if (!(globalScreenName === screenName)) {
    globalScreenName = screenName;
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
    appsFlyer.logEvent(screenName);
  }
};
