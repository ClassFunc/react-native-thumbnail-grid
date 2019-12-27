import React, {useEffect, useRef, useState} from 'react';
import {Video} from "expo-av";
import loadingImg from './loading.gif'
import {Dimensions, Image} from 'react-native'
import {getCache} from './CacheManager'

const {width} = Dimensions.get('window')

function VideoPlayer({video, styles, videoSettings}) {
    const [loading, setLoading] = useState(false)
    const [uri, setUri] = useState('')
    const ref = useRef(null)
    let mount = true
    useEffect(() => {
        getLocalUri()
        return () => {
            mount = false
            if (ref && ref.current) {
                try {
                    ref.current.unloadAsync()
                } catch (e) {
                    console.log('error unload', ref, e);
                }
            }
        }
    }, [])
    const getLocalUri = async () => {
        const data = await getCache(video)
        if (mount)
            setUri(typeof data === "string" ? data : data.uri)
    }
    if (!uri)
        return (
            <Image style={styles} source={loadingImg}/>
        )

    return (
        <Video
            source={{uri}}
            resizeMode={"cover"}
            shouldPlay={true}
            rate={1.0}
            isMuted={true}
            volume={1.0}
            isLooping={true}
            // usePoster
            // posterSource={loadingImg}
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
