import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Form, ListGroup, OverlayTrigger,
  Popover, ProgressBar,
  Spinner
} from 'react-bootstrap'
import {
  CloudArrowDown, Images, Trash
} from 'react-bootstrap-icons'
import AdminLayout from '../../components/adminLayout'
import { ErrorAlert, SuccessAlert, WarningAlert } from '../../components/alert'
import { deleteVideo, generateVideoThumbnails, getAllVideos, GetAllVideosResponse, getUploadVideoSignedUrl, GetUserSessionsResponse, getVideoUrl, uploadVideoBySignedUrl } from '../../services/api'

type Props = {
  getAllVideosResponse?: GetAllVideosResponse,
  getUserSessionsReponse?: GetUserSessionsResponse
}

type Upload = {
  fileName: string,
  percent: number,
  variant: 'success' | 'info' | 'warning' | 'danger'
}

const AdminHome: NextPage = (props: Props) => {
  const router = useRouter()

  const [uploadByFileName, setUploadByFileName] = useState<{
    [key: string]: Upload
  }>({})

  const [downloadLoadingByFileName, setDownloadLoadingByFileName] = useState<{
    [key: string]: boolean
  }>({})

  const [generateThumbnailLoadingByFileName, setGenerateThumbnailLoadingByFileName] = useState<{
    [key: string]: boolean
  }>({})

  const [deleteLoadingByFileName, setDeleteLoadingByFileName] = useState<{
    [key: string]: boolean
  }>({})

  const [videos, setVideos] = useState<GetAllVideosResponse | undefined>()
  const [isVideoLoading, setIsVideoLoading] = useState(false)

  useEffect(() => {
    getData()
  }, [])

  const getData = () => {
    setIsVideoLoading(true)
    getAllVideos()
      .then(res => {
        setVideos(res)
      })
      .finally(() => setIsVideoLoading(false))
  }

  async function onUpload() {

    const fileInput = document.getElementById('formFile')
    if (fileInput instanceof HTMLInputElement) {
      const files = fileInput?.files
      if (!files) return null

      /**Populate list */
      const _uploadByFileName: {
        [key: string]: Upload
      } = {}
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        _uploadByFileName[file?.name || ''] = {
          fileName: file?.name || '',
          percent: 0,
          variant: 'info'
        }
        setUploadByFileName(_uploadByFileName)
      }

      /**Upload */
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {

          setUploadByFileName(prev => ({
            ...prev,
            [file?.name || '']: {
              fileName: file?.name || '',
              percent: 10,
              variant: 'info'
            }
          }))

          const { url } = await getUploadVideoSignedUrl(file?.name || '')

          setUploadByFileName(prev => ({
            ...prev,
            [file?.name || '']: {
              fileName: file?.name || '',
              percent: 50,
              variant: 'info'
            }
          }))

          await uploadVideoBySignedUrl(url, file)

          setUploadByFileName(prev => ({
            ...prev,
            [file?.name || '']: {
              fileName: file?.name || '',
              percent: 80,
              variant: 'info'
            }
          }))

          await generateVideoThumbnails(file?.name || '')

          setUploadByFileName(prev => ({
            ...prev,
            [file?.name || '']: {
              fileName: file?.name || '',
              percent: 100,
              variant: 'success'
            }
          }))

          SuccessAlert('Uploaded!')
        }
        catch (err) {

          setUploadByFileName(prev => ({
            ...prev,
            [file?.name || '']: {
              fileName: file?.name || '',
              percent: prev[file?.name].percent,
              variant: 'danger'
            }
          }))
          ErrorAlert(err?.toString() || 'Something went wrong')
        }
      }
      getData()
    }
  }


  async function onDownload(fileName: string) {
    setDownloadLoadingByFileName(prev => ({
      ...prev,
      [fileName]: true
    }))

    getVideoUrl(fileName)
      .then(res => {
        const a = document.createElement('a')
        a.href = res.url
        a.download = fileName
        a.target = '__blank'
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      .catch(err => {
        alert(err)
      })
      .finally(() => {
        setDownloadLoadingByFileName(prev => ({
          ...prev,
          [fileName]: false
        }))
      })
  }

  async function onGenerateThumbnails(fileName: string) {
    setGenerateThumbnailLoadingByFileName(prev => ({
      ...prev,
      [fileName]: true
    }))

    generateVideoThumbnails(fileName)
      .then(res => {
        setVideos(prev => prev)
      })
      .catch(err => {
        alert(err)
      })
      .finally(() => {
        setGenerateThumbnailLoadingByFileName(prev => ({
          ...prev,
          [fileName]: false
        }))
      })

  }

  async function onDeleteVideo(fileName: string) {
    setDeleteLoadingByFileName(prev => ({
      ...prev,
      [fileName]: true
    }))

    deleteVideo(fileName)
      .then(res => {
        setVideos(prev => {
          if (prev) {
            delete prev[fileName]
          }
          return prev
        })
      })
      .finally(() => {
        setDeleteLoadingByFileName(prev => ({
          ...prev,
          [fileName]: false
        }))

        SuccessAlert('Deleted')
      })
      .catch(err => {
        alert(err)
      })
  }

  return (
    <AdminLayout>
      <div
        style={{
          padding: 20,
          display: 'flex',
          gap: 10,
          flexDirection: 'column'
        }}
      >
        <Card
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-around',
            flexDirection: 'column',
            rowGap: 20,
            gap: 5,
          }}
        >
          <Card.Header>
            Upload a new video
          </Card.Header>
          <Card.Body>

            <Form.Group controlId="formFile" className="mb-3">
              <div
                style={{
                  display: 'flex',
                  gap: 5,
                }}
              >
                <Form.Control type="file" multiple />
                <Button
                  variant='primary'
                  onClick={e => {
                    onUpload()
                  }}
                >
                  Upload
                </Button>
              </div>
            </Form.Group>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <ListGroup >

                {
                  Object.values(uploadByFileName).map((upload, i) => {
                    return (
                      <ListGroup.Item key={upload.fileName}>
                        <p
                          style={{
                            overflowWrap: 'break-word',
                            marginBottom: 0,
                          }}
                        >
                          ({i + 1}/{Object.keys(uploadByFileName).length}){upload.fileName}
                        </p>
                        <ProgressBar now={upload.percent} variant={upload.variant} animated={upload.percent < 100} />
                      </ListGroup.Item>
                    )
                  })
                } </ListGroup>
            </div>
          </Card.Body>
        </Card>
        <Card
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-around',
            flexDirection: 'column',
            rowGap: 20,
            gap: 5,
          }}
        >
          <Card.Header>
            Videos
          </Card.Header>
          <Card.Body>

            {
              isVideoLoading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Spinner animation='border' />
                </div>
              ) : (
                videos &&
                Object.keys(videos).map((key, i) => {

                  const video = videos && videos[key]

                  const href = `${router.basePath}/?v=${video?.name}`

                  return (

                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginBottom: 20
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          width: '100%',
                          marginBottom: 10,
                        }}
                      >
                        <a
                          href={href}
                          target='_blank'
                          rel="noopener noreferrer"
                          style={{
                            overflowWrap: 'break-word',
                            width: '50%'
                          }}
                        >
                          ({i + 1} / {videos && Object.keys(videos).length}) {video?.name}
                        </a>
                        <div
                          style={{
                            display: 'flex',
                            gap: 5,
                          }}
                        >
                          <OverlayTrigger
                            overlay={
                              <Popover body>
                                Download video
                              </Popover>
                            }
                          >
                            <Button
                              variant='outline-dark'
                              onClick={() => onDownload(video?.name || '')}
                              disabled={downloadLoadingByFileName[video?.name || '']}
                            >
                              {
                                downloadLoadingByFileName[video?.name || ''] ? (
                                  <Spinner animation="border" size='sm' />
                                ) : (
                                  <CloudArrowDown />
                                )
                              }
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            overlay={
                              <Popover body>
                                Generate thumbnails
                              </Popover>
                            }
                          >
                            <Button
                              onClick={() => onGenerateThumbnails(video?.name || '')}
                              disabled={generateThumbnailLoadingByFileName[video?.name || '']}
                              variant='outline-dark'
                            >
                              {
                                generateThumbnailLoadingByFileName[video?.name || ''] ? (
                                  <Spinner animation="border" size='sm' />
                                ) : (
                                  <Images />
                                )
                              }
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            overlay={
                              <Popover body>
                                Delete video
                              </Popover>
                            }
                          >
                            <Button
                              variant='outline-danger'
                              onClick={() => onDeleteVideo(video?.name || '')}
                              disabled={downloadLoadingByFileName[video?.name || '']}
                            >
                              {
                                deleteLoadingByFileName[video?.name || ''] ? (
                                  <Spinner animation="border" size='sm' />
                                ) : (
                                  <Trash />
                                )
                              }
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          gap: 10,
                          flexWrap: 'wrap'
                        }}
                      >
                        {
                          video?.thumbnails?.map(thumbnail => {
                            return (
                              <img
                                key={thumbnail.url}
                                src={thumbnail?.url}
                                style={{
                                  maxWidth: 150,
                                  maxHeight: 80,
                                }}
                                loading='lazy'
                              />
                            )
                          })
                        }
                      </div>
                    </div>
                  )
                })
              )
            }
          </Card.Body>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminHome
