import React from 'react';
import {Image as RNImage, View} from 'react-native'
import {Image} from 'react-native-expo-image-cache'
import CenterView from "../../Component/CenterView";
import playBtnImg from './playBtn.png'

function VideoThumb(props) {
    const {video, styles, width, height, fixSize = 1} = props
    const btnTop = height / 2 / fixSize - 25
    const btnRight = width / 2 - 25
    return (
        <View style={[{position: 'relative'}, styles]}>
            <CenterView>
                <View>
                    <Image uri={video.thumbnail || video.uri} style={styles}/>
                </View>
                <RNImage source={playBtnImg}
                         style={{
                             alignItems: 'center',
                             borderRadius: 25,
                             backgroundColor: '#000',
                             position: 'absolute',
                             right: btnRight,
                             top: btnTop,
                             width: 50,
                             height: 50
                         }}
                />
            </CenterView>
        </View>
    );
}

export default VideoThumb;
