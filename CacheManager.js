import React from 'react';
import * as FileSystem from 'expo-file-system'

const BASE_URI = `${FileSystem.cacheDirectory}saga-video-cache/`

export const getCache = async (video) => {
    const tmpPath = BASE_URI + video.filename
    const data = await FileSystem.getInfoAsync(tmpPath)
    console.log('data', data)
    if (data.exists) {
        console.log('cached exists')
        return data
    }
    try {
        await FileSystem.makeDirectoryAsync(BASE_URI);
    } catch (e) {
        // do nothing
    }

    const result = await FileSystem.createDownloadResumable(video.uri, tmpPath).downloadAsync()
    console.log(result)
    if (result && result.status !== 200) {
        console.log('cache fail')
        return video.uri
    }
    return tmpPath
}


