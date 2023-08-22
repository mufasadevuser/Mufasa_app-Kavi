import React, { useEffect } from 'react';
import {
    Text,
    SafeAreaView,
    Pressable,
    View,
    Linking,
    Image,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {trackScreen} from "../../controller/analytics";

const NeedHelp = props => {
    const {navigation = () => null} = props;
    useEffect(()=>{trackScreen("NeedHelp")},[])
    return (
        <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
            <View style={{paddingHorizontal: 16, flex: 1}}>
                <View style={{marginBottom: 32}}>
                    <Pressable
                        hitSlop={20}
                        style={{flexDirection: 'row', alignItems: 'center'}}
                        onPress={() => {
                            navigation?.goBack?.();
                        }}>
                        <FontAwesome5 name="angle-left" size={20} color="#000"/>
                        <Text style={{fontWeight: '600', color: '#000', fontSize: 16}}>
                            {'   '}Need Help?
                        </Text>
                    </Pressable>
                </View>

                <View
                    style={{
                        flex: 1,
                        marginBottom: '30%',
                    }}>
                    {/* <Image
            style={{height: 60, marginBottom: 16}}
            source={require('../../../assets/images/icons/logoIcon.png')}
            resizeMode="contain"
          /> */}
                    <Text
                        style={{
                            fontWeight: '600',
                            fontSize: 18,
                            color: '#E2C25B',
                            marginBottom: 12,
                        }}>
                        Contact us
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                        <MaterialIcons
                            name="mail"
                            size={18}
                            color="#000"
                            style={{marginRight: 12}}
                        />
                        <Text
                            style={{marginBottom: 8, color: '#000', fontSize: 16}}
                            onPress={() => {
                                Linking.openURL(`mailto:customersupport@mufasa.ae`);
                            }}>
                            <Text style={{fontWeight: '600', color: '#000'}}>Mail : </Text>
                            customersupport@mufasa.ae
                        </Text>
                    </View>

                    <View style={{flexDirection: 'row'}}>
                        <FontAwesome5
                            name="whatsapp"
                            size={18}
                            color="#000"
                            style={{marginRight: 12}}
                        />
                        <Text
                            style={{marginBottom: 8, color: '#000', fontSize: 16}}
                            onPress={() => {
                                Linking.openURL(`https://wa.me/+919108725955`);
                            }}>
                            <Text style={{fontWeight: '600', color: '#000'}}>
                                Whatsapp :{' '}
                            </Text>
                            +91 9108725955
                        </Text>
                    </View>

                    <View style={{flexDirection: 'row'}}>
                        <MaterialIcons
                            name="phone-iphone"
                            size={18}
                            color="#000"
                            style={{marginRight: 12}}
                        />
                        <Text style={{fontWeight: '600', color: '#000', fontSize: 16}}>
                            Mobile :{' '}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            marginTop: 24,
                            width: '100%',
                            justifyContent: 'center',
                        }}>
                        <Pressable
                            style={{
                                alignItems: 'center',
                                paddingHorizontal: 16,
                                borderRightWidth: 1,
                                borderRightColor: '#efefef',
                            }}
                            onPress={() => {
                                Linking.openURL(`tel:+971525030289`);
                            }}>
                            <Text style={{fontWeight: '600', color: '#E2C25B'}}>Dubai</Text>
                            <Text style={{color: '#000'}}>+971 525030289</Text>
                        </Pressable>

                        <Pressable
                            style={{alignItems: 'center', paddingHorizontal: 16}}
                            onPress={() => {
                                Linking.openURL(`tel:+919108725955`);
                            }}>
                            <Text style={{fontWeight: '600', color: '#E2C25B'}}>India</Text>
                            <Text style={{color: '#000'}}>+91 9108725955</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        style={{height: 80, marginBottom: 16}}
                        source={require('../../../assets/images/new_logo.png')}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default NeedHelp;
