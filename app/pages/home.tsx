import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { ArrowClockwise, ArrowsFullscreen } from 'react-bootstrap-icons'
import Layout from '../components/layout'
import { clearCache, getAllVideos, GetAllVideosResponse, getVideoUrl, GetVideoUrlResponse } from '../services/api'

const Home = () => {

  const router = useRouter()
  const [videoUrl, setVideoUrl] = useState('')
  const [controls, setControls] = useState({
    isMaxHeight: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshCacheLoading, setIsRefreshCacheLoading] = useState(false)
  const [videos, setVideos] = useState<GetAllVideosResponse | undefined>()

  let videoName = router.query.v?.toString() || ''

  if (
    !videoName
    && videos
  ) {
    const firstVideoName = Object.entries(videos)[0] && Object.entries(videos)[0][0]
    videoName = firstVideoName
  }

  const video = videos && Object.values(videos)
    .find(video => video.name === videoName)

  useEffect(() => {
    getApiData()
  }, [])

  const getApiData = () => {
    getAllVideos()
      .then(res => {
        setVideos(res)
      })
  }

  useEffect(() => {

    setIsLoading(true)
    getVideoUrl(videoName)
      .then((res: GetVideoUrlResponse) => {

        setVideoUrl(res.url)
      })
      .finally(() => setIsLoading(false))

    /*
    Set last viewed time before leaving page
    so use can come back to last viewed time when revisit link
    */
    window.onbeforeunload = () => {
      const videoEl = document.getElementsByTagName('video')[0]
      if (videoEl instanceof HTMLVideoElement) {
        localStorage.setItem(videoName, videoEl.currentTime.toString())
      }
    }

  }, [videoName])

  return (
    <Layout>
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            height: '60vh'
          }}
          id='video-container'
        >

          <video
            onLoadedData={(e) => {
              const videoEl = e.target

              if (videoEl instanceof HTMLVideoElement) {
                /*
                Get and set last viewed time, if available
                */
                const currentTime = Number(localStorage.getItem(videoName))
                if (currentTime) {
                  videoEl.currentTime = currentTime
                }
              }

            }}
            style={{
              height: '100%',
              width: '100%'
            }}
            controls
            src={videoUrl ? videoUrl : undefined}
            poster={video?.thumbnails[0].url}
            controlsList='nodownload'
          />
          <div
            style={{
              padding: 13,
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
              width: '100%'
            }}
          >
            <Button
              style={{
                width: 150,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
              onClick={e => {

                const videoContainer = document.getElementById('video-container')
                if (!videoContainer) return null

                if (controls.isMaxHeight) {
                  videoContainer.style.height = '60vh'
                } else {
                  videoContainer.style.height = '93vh'
                }

                setControls(prev => {
                  return {
                    ...prev,
                    isMaxHeight: !prev.isMaxHeight
                  }
                })
              }}
              variant={controls.isMaxHeight ? 'light' : 'outline-light'}
              size='sm'
            >
              <ArrowsFullscreen />
              <p style={{ marginBottom: 0 }}>Cinema mode</p>
            </Button>

            <Button
              style={{
                width: 150,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
              onClick={e => {
                setIsRefreshCacheLoading(true)
                clearCache()
                  .then(res => {
                    if (res.success) {
                      setVideos(undefined)
                      getApiData()
                    }
                  })
                  .finally(() => {
                    setIsRefreshCacheLoading(false)
                  })
              }}
              variant={'outline-light'}
              size='sm'
              disabled={isRefreshCacheLoading}
            >
              {
                isRefreshCacheLoading ? (
                  <Spinner animation='border' size='sm' />
                ) : (
                  <ArrowClockwise />
                )
              }
              <p style={{ marginBottom: 0 }}>Refresh cache</p>
            </Button>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            rowGap: 10,
            gap: 5,
          }}
        >
          {
            videos ? (
              Object.keys(videos).map(key => {

                const video = videos && videos[key]
                let counter = 0
                const firstThumbnail = video?.thumbnails[counter]
                let timer: NodeJS.Timer

                const href = `${router.basePath}/?v=${video?.name}`

                return (

                  <a
                    key={key}
                    href={href}
                    style={{
                      color: 'white',
                      textDecoration: 'none'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: 150,
                        height: 180,
                      }}
                    >
                      <img
                        src={firstThumbnail?.url}
                        style={{
                          maxWidth: 150,
                          maxHeight: 80,
                        }}
                        loading='lazy'
                        onError={e => {
                          clearInterval(timer)
                          counter = 0

                        }}
                        onMouseEnter={e => {

                          timer = setInterval(() => {

                            counter++
                            const newThumbnail = video?.thumbnails[counter]

                            if (e.target instanceof HTMLImageElement) {
                              e.target.src = newThumbnail?.url || ''
                            }

                            if (counter + 1 === video?.thumbnails.length) {
                              counter = 0
                            }
                          }, 0.4 * 1000)
                        }}
                        onMouseLeave={e => {
                          clearInterval(timer)
                          counter = 0

                          if (e.target instanceof HTMLImageElement) {
                            e.target.src = firstThumbnail?.url || ''
                          }
                        }}
                      />
                      <div
                        style={{
                          width: '100%',
                        }}
                      >
                        <p
                          style={{
                            overflowWrap: 'break-word',
                            fontSize: 15,
                          }}
                        >
                          {video?.name}
                        </p>
                      </div>
                    </div>
                  </a>
                )
              })
            ) : (
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
        </div>
      </div>
    </Layout>
  )
}
export default Home
