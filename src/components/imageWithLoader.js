import React, {useState} from 'react';
import {ActivityIndicator, Image, View} from 'react-native';

const ImageWithLoader = props => {
  const [showLoader, setShowLoader] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View>
      <Image
        {...props}
        onLoadEnd={() => {
          setShowLoader(false);
          props?.onLoadEnd?.();
        }}
        onError={() => {
          setHasError(true);
        }}
        defaultSource={
          props?.defaultSource ??
          require('../../assets/images/icons/logoIcon.png')
        }
        resizeMode={hasError ? 'contain' : props?.resizeMode}
      />

      {showLoader && (
        <View
          style={{
            backgroundColor: 'gray',
            position: 'absolute',
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
          }}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

export {ImageWithLoader};
