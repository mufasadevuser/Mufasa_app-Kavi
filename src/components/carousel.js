import _ from 'lodash';
import React, {useState} from 'react';
import {FlatList, View} from 'react-native';

export const Carousel = ({data, renderItem, style}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const viewConfigRef = React.useRef({viewAreaCoveragePercentThreshold: 1});

  const onViewRef = React.useRef(viewableItems => {
    setSelectedIndex(_.get(viewableItems, 'viewableItems[0].index', 0));
  });

  return (
    <View>
      <FlatList
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        initialNumToRender={1}
        style={style}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 10,
          left: 0,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <IndicatorFooter selectedIndex={selectedIndex} items={data} />
      </View>
    </View>
  );
};

const IndicatorFooter = ({selectedIndex, items}) => {
  return (
    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
      {_.map(items, (item, index) => {
        return (
          <View
            key={index}
            style={[
              {
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  index === selectedIndex ? '#EF6E0B' : '#E3F0F5',
                marginRight: 6,
              },
            ]}
          />
        );
      })}
    </View>
  );
};
