import { useEffect, useState } from 'react'
import { ProgressBar, Spinner } from 'react-bootstrap'
import { ArrowClockwise, ArrowCounterclockwise, Fullscreen, Pause, Play } from 'react-bootstrap-icons'
import { ErrorAlert } from '../components/alert'
import Layout from '../components/layout'
import { getAllVideos, GetAllVideosResponse, getVideoUrl } from '../services/api'

type Props = {
  getAllVideosResponse?: GetAllVideosResponse,
}

type VideoState = {
  isShowControls: boolean,
  isPlaying: boolean,
  isFullScreen: boolean,
  percent: number,
  isBuffering: boolean,
  currentTime: number,
}

const FAST_FORWARD_DURATION_SECONDS = 5
const REWIND_DURATION_SECONDS = 5

let timer: NodeJS.Timeout
const MobileHome = (props: Props) => {
  const [videoStateByFileName, setVideoStateByFileName] = useState<{
    [key: string]: VideoState
  }>({})
  const [videos, setVideos] = useState<GetAllVideosResponse | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getApiData()
  }, [])

  const getApiData = () => {
    setIsLoading(true)
    getAllVideos()
      .then(res => {
        setVideos(res)

        let _videoStateByFileName: {
          [key: string]: VideoState
        } = {}
        Object.keys(res).map(key => {
          _videoStateByFileName[key] = {
            isShowControls: false,
            isPlaying: false,
            isFullScreen: false,
            percent: 0,
            isBuffering: false,
            currentTime: 0
          }
        })
        setVideoStateByFileName(_videoStateByFileName)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const onPlay = async (videoName: string) => {
    blinkControls(videoName)

    const videoEl = getVideoEl(videoName)
    if (!videoEl) return null

    setVideoStateByFileName(prev => ({
      ...prev,
      [videoName]: {
        ...prev[videoName],
        isBuffering: videoEl.readyState < 2
      }
    }))

    if (!videoEl.src) {
      try {
        const response = await getVideoUrl(videoName)
        videoEl.src = response.url
      } catch (err) {
        ErrorAlert(err?.toString() || `Something went wrong`)
      }
    }
    videoEl.play()

    const timer = setInterval(() => {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
      const isBuffering = videoEl.readyState < 2

      if (!isBuffering) {
        setVideoStateByFileName(prev => ({
          ...prev,
          [videoName]: {
            ...prev[videoName],
            isPlaying: true,
            isBuffering: false,
          }
        }))
        clearInterval(timer)
      }
    }, 0.1 * 1000)
  }

  const onPause = async (videoName: string) => {
    blinkControls(videoName)

    const videoEl = getVideoEl(videoName)
    videoEl?.pause()

    setVideoStateByFileName(prev => ({
      ...prev,
      [videoName]: {
        ...prev[videoName],
        isPlaying: false,
        isBuffering: false,
      }
    }))
  }

  const onFullScreen = (videoName: string) => {
    const videoEl = getVideoEl(videoName)
    const videoContainerEl = document.getElementById(`${videoName}-container`)
    const controlEl = document.getElementById(`${videoName}-controls`)
    const progressEl = document.getElementById(`${videoName}-progress`)
    const videoState = videoStateByFileName[videoName]

    if (!videoEl || !progressEl || !videoState || !videoContainerEl || !controlEl) {
      console.log({
        videoEl, progressEl, videoState, videoContainerEl
      })
      return null
    }

    if (videoState.isFullScreen) {
      document.exitFullscreen()
      Object.assign(videoContainerEl.style, {
        transform: 'rotate(0deg)',
      })

      const img = document.createElement('img')
      img.src = videoEl?.poster || ''

      const isLandscape = img.width > img.height
      if (isLandscape) {
        videoEl.classList.add('video')
        videoEl.classList.remove('video-landscape')

        controlEl.classList.add('control')
        controlEl.classList.remove('controls-landscape')

        videoContainerEl.classList.add('container')
        videoContainerEl.classList.remove('container-landscape')
      }

      setVideoStateByFileName(prev => ({
        ...prev,
        [videoName]: {
          ...prev[videoName],
          isFullScreen: false,
        }
      }))
    } else {
      videoContainerEl.requestFullscreen()

      const img = document.createElement('img')
      img.src = videoEl?.poster || ''

      const isLandscape = img.width > img.height
      if (isLandscape) {
        videoEl.classList.remove('video')
        videoEl.classList.add('video-landscape')

        controlEl.classList.remove('control')
        controlEl.classList.add('controls-landscape')

        videoContainerEl.classList.remove('container')
        videoContainerEl.classList.add('container-landscape')

        progressEl.classList.remove('progress')
        progressEl.classList.add('progress-landscape')
      }

      setVideoStateByFileName(prev => ({
        ...prev,
        [videoName]: {
          ...prev[videoName],
          isFullScreen: true,
        }
      }))
    }
  }

  const onFastForward = (videoName: string) => {
    blinkControls(videoName)

    const videoEl = getVideoEl(videoName)
    if (videoEl) {
      videoEl.currentTime += FAST_FORWARD_DURATION_SECONDS
    }
  }

  const onRewind = (videoName: string) => {
    blinkControls(videoName)

    const videoEl = getVideoEl(videoName)
    if (videoEl) {
      videoEl.currentTime += REWIND_DURATION_SECONDS
    }
  }

  const onDismiss = (videoName: string) => {
    const controlEl = document.getElementById(`${videoName}-controls`)

    if (controlEl instanceof HTMLDivElement) {
      clearTimeout(timer)
      controlEl.classList.add('hidden')
      controlEl.classList.remove('animated', 'snapIn', 'fadeOut')
    }
  }

  const blinkControls = async (videoName: string) => {
    const controlEl = document.getElementById(`${videoName}-controls`)
    if (controlEl instanceof HTMLDivElement) {

      controlEl.classList.remove('hidden')
      controlEl.classList.add('animated', 'snapIn')

      clearTimeout(timer)
      timer = setTimeout(async () => {

        controlEl.classList.remove('snapIn')
        controlEl.classList.add('fadeOut')

        /**
         * 8/10/2022 daniel.kwok
         * wait duration must be the same as animation-duration in css
         */
        await wait(0.5)
        controlEl.classList.remove('animated', 'snapIn', 'fadeOut')
        controlEl.classList.add('hidden')
      }, 2 * 1000)
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          width: '100%'
        }}
      >
        <Spinner animation='border' />
      </div>
    )
  }

  return (
    <Layout>
      <div>
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            rowGap: 10,
            gap: 5,
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {
            videos &&
            Object.keys(videos).map(videoName => {

              const video = videos && videos[videoName]
              let counter = 0
              const firstThumbnail = video?.thumbnails[counter]
              const videoState = videoStateByFileName[videoName] || {}
              const videoEl = getVideoEl(videoName)

              return (
                <div
                  className='container'
                  key={videoName}
                  id={`${videoName}-container`}
                >
                  <div
                    key={videoName}
                    style={{
                      position: 'relative',
                    }}
                  >
                    {/* Controls */}
                    <div
                      className='controls hidden'
                      id={`${videoName}-controls`}
                    >
                      <div
                        id={`${videoName}-backdrop`}
                        onClick={() => onDismiss(videoName)}
                        style={{
                          height: '100%',
                          width: '100%',
                          position: 'absolute',
                          zIndex: 1
                        }}
                      >
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-around',
                          alignItems: 'center',
                          height: '100%'
                        }}
                      >

                        {
                          videoState?.isBuffering ? (
                            <Spinner animation='border' style={{ color: 'white', borderWidth: 2 }} />
                          ) : (
                            <>

                              {
                                videoEl?.src ? (
                                  <div
                                    className={'circle'}
                                  >
                                    <ArrowCounterclockwise
                                      onClick={() => onRewind(videoName)}
                                      style={{
                                        fontSize: 30,
                                        color: 'white',
                                      }}
                                    />
                                  </div>

                                ) : null
                              }
                              <div
                                className={'circle'}
                              >
                                {
                                  videoState.isPlaying ? (
                                    <Pause
                                      onClick={() => onPause(videoName)}
                                      style={{
                                        fontSize: 30,
                                        color: 'white',
                                      }}
                                    />
                                  ) : (
                                    <Play
                                      onClick={() => onPlay(videoName)}
                                      style={{
                                        fontSize: 30,
                                        color: 'white',
                                      }}
                                    />
                                  )
                                }
                              </div>

                              {
                                videoEl?.src ? (
                                  <div
                                    className={'circle'}
                                  >
                                    <ArrowClockwise
                                      onClick={() => onFastForward(videoName)}
                                      style={{
                                        fontSize: 30,
                                        color: 'white',
                                      }}
                                    />
                                  </div>
                                ) : null
                              }
                            </>
                          )
                        }
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          marginRight: 20,
                          marginBottom: 20,
                          zIndex: 1,
                        }}
                      >
                        <Fullscreen
                          onClick={() => onFullScreen(videoName)}
                          style={{
                            fontSize: 20,
                            color: 'white',
                          }}
                        />
                      </div>

                      {/* Title, timestamp */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          overflowWrap: 'break-word',
                          fontSize: 15,
                          color: 'white',
                        }}
                      >
                        <p
                          style={{
                            marginBottom: 0
                          }}
                        >
                          {video?.name}
                        </p>
                        {
                          videoEl?.src ? (
                            <p>
                              {getFormattedDurationFromSeconds(videoState.currentTime)} : {getFormattedDurationFromSeconds(videoEl?.duration)}
                            </p>
                          ) : null
                        }
                      </div>
                    </div>

                    {/* Player */}
                    <video
                      onClick={() => {
                        blinkControls(videoName)
                      }}
                      className='video'
                      poster={firstThumbnail?.url}
                      autoPlay
                      id={`${videoName}-video`}
                      loop={true}
                      onTimeUpdate={e => {
                        if (videoEl) {
                          const currentTimeSeconds = videoEl.currentTime
                          const totalDurationSeconds = videoEl.duration
                          const percent = Number((currentTimeSeconds / totalDurationSeconds * 100).toFixed(0))

                          setVideoStateByFileName(prev => ({
                            ...prev,
                            [videoName]: {
                              ...prev[videoName],
                              percent: percent,
                              currentTime: currentTimeSeconds,
                            }
                          }))
                        }
                      }}
                    />
                  </div>
                  {/* Progress bar */}
                  <ProgressBar
                    className='progress'
                    id={`${videoName}-progress`}
                    style={{
                      visibility: videoEl?.src ? 'visible' : 'hidden'
                    }}
                    onClick={e => {
                      /**
                       * 8/10/2022 daniel.kwok
                       * onuserseek
                       */

                      setVideoStateByFileName(prev => ({
                        ...prev,
                        [videoName]: {
                          ...prev[videoName],
                          isBuffering: true
                        }
                      }))

                      const mouseX = e.clientX
                      const totalWidth = window.innerWidth
                      const ratio = mouseX / totalWidth
                      const percent = Number((ratio * 100).toFixed(0))
                      const prevPercent = videoStateByFileName[videoName].percent

                      if (prevPercent !== percent) {

                        setVideoStateByFileName(prev => ({
                          ...prev,
                          [videoName]: {
                            ...prev[videoName],
                            percent: percent
                          }
                        }))
                      }

                      if (videoEl) {
                        videoEl.currentTime = Number((videoEl.duration * ratio).toFixed(0))

                        const timer = setInterval(() => {
                          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
                          const isBuffering = videoEl.readyState < 2
                          console.log({ isBuffering })

                          if (!isBuffering) {
                            setVideoStateByFileName(prev => ({
                              ...prev,
                              [videoName]: {
                                ...prev[videoName],
                                isBuffering: false,
                              }
                            }))
                            clearInterval(timer)
                          }
                        }, 0.1 * 1000)
                      }
                    }}
                    variant='danger'
                    now={videoStateByFileName[videoName]?.percent}
                  />
                </div>
              )
            })
          }
        </div>
      </div>
    </Layout >
  )
}

const getVideoEl = (videoName: string): HTMLVideoElement | null => {
  const videoEl = document.getElementById(`${videoName}-video`)

  if (videoEl instanceof HTMLVideoElement) {
    return videoEl
  } else {
    return null
  }
}

function getFormattedDurationFromSeconds(durationInSeconds?: number): string | undefined {
  if (!durationInSeconds) return undefined
  const SECONDS_IN_MINUTE = 60

  const minute = (durationInSeconds / SECONDS_IN_MINUTE).toFixed(0).padStart(2, '0')
  const seconds = (durationInSeconds % SECONDS_IN_MINUTE).toFixed(0).padStart(2, '0')
  const formatted = `${minute}:${seconds}`

  return formatted
}

function wait(seconds = 1): Promise<void> {
  return new Promise((res, rej) => {
    setTimeout(() => res(), seconds * 1000)
  })
}


export default MobileHome
