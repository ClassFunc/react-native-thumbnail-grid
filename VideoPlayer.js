import React, {useEffect, useRef} from 'react';
import {Video} from "expo-av";
import loading from './loading.gif'
import {Dimensions} from 'react-native'

const {width} = Dimensions.get('window')

function VideoPlayer({video, styles, videoSettings}) {

    const ref = useRef(null)

    useEffect(() => {
        return () => {
            if (ref && ref.current) {
                try {
                    ref.current.unloadAsync()
                } catch (e) {
                    console.log('error unload', ref, e);
                }
            }
        }
    }, [])

    return (
        <Video
            source={typeof video === 'string' ? {uri: video} : video}
            resizeMode={"cover"}
            shouldPlay={true}
            rate={1.0}
            isMuted={true}
            volume={1.0}
            isLooping={true}
            usePoster
            posterSource={loading}
            posterStyle={styles}
            style={styles}
            onError={async error => {
                console.log(error)
            }}
            {...videoSettings}
            ref={ref}
        />
    );
}

export default VideoPlayer;
