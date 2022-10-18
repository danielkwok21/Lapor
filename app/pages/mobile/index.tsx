import React, { useEffect, useState } from 'react'
import { Fullscreen } from 'react-bootstrap-icons'

export default function Mobile() {

    const mp4 = `https://raw.githubusercontent.com/Ahmetaksungur/twitter-video-player-clone/master/92908881_1592415477584282_4773659066559534074_n.mp4`
    const [videoState, setVideoState] = useState<{
        progress: number,
        el: HTMLVideoElement | null,
        isFullScreen: boolean
    }>({
        progress: 0,
        el: null,
        isFullScreen: false,
    })

    useEffect(() => {
        const videoEl = document?.getElementsByTagName('video')[0]
        setVideoState(prev => ({
            ...prev,
            el: videoEl
        }))

    }, [])

    useEffect(() => {
        setInterval(() => {
            if (!videoState.el) return null
            const currentTimeSeconds = videoState.el?.currentTime || 1
            const totalDurationSeconds = videoState.el?.duration || 1
            const percent = Number((currentTimeSeconds / totalDurationSeconds * 100).toFixed(0))

            setVideoState(prev => ({
                ...prev,
                progress: percent
            }))
        }, 0.1 * 1000)
    }, [videoState.el])

    return (
        <div
            style={{
                position: 'relative'
            }}
            id='container'
        >
            <video
                autoPlay={true}
                src={mp4}
                loop={true}
                onClick={e => {
                    if (videoState.el?.paused) {
                        videoState.el?.play()
                    } else {
                        videoState.el?.pause()
                    }
                }}
                style={{
                    width: '100%',
                }}
                onTimeUpdate={e => {
                }}
            />

            <div
                style={{
                    width: '98%',
                    height: 5,
                    margin: '1%',
                    backgroundColor: 'grey',
                    position: 'absolute',
                    bottom: 50,
                    borderRadius: 5,
                }}
            >

            </div>
            <div
                style={{
                    width: `${videoState.progress - 2}%`,
                    height: 5,
                    margin: '1%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    bottom: 50,
                    borderRadius: 5,
                }}
            >

            </div>
            <Fullscreen
                style={{
                    color: 'white',
                    position: 'absolute',
                    bottom: 20,
                    right: 10,
                    fontSize: 20,
                    cursor: 'pointer'
                }}
                onClick={e => {
                    const container = document.getElementById('container')
                    if(videoState?.isFullScreen){
                        document.exitFullscreen()
                        setVideoState(prev => ({
                            ...prev,
                            isFullScreen: false,
                        }))
                    }else{
                        container?.requestFullscreen()
                        setVideoState(prev => ({
                            ...prev,
                            isFullScreen: true,
                        }))
                    }
                }}
            />

        </div>
    )
}
