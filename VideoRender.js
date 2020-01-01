import React from 'react';
import VideoPlayer from "react-native-thumbnail-grid-expo/VideoPlayer";
import VideoThumb from "react-native-thumbnail-grid-expo/VideoThumb";

function VideoRender(props) {
    const {video, playing, videoPlay, width, height, styles, videoSettings, fixSize = 1} = props
    if (playing && videoPlay)
        return (
            <VideoPlayer
                video={video}
                styles={styles}
                {...videoSettings}
            />
        )
    return (
        <VideoThumb
            video={video}
            styles={styles}
            width={width}
            height={height}
            fixSize={fixSize}
        />
    )
}

export default VideoRender;
