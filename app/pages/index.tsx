import { useState } from 'react'
import { Form, ProgressBar, Spinner } from 'react-bootstrap'
import { ErrorAlert, SuccessAlert } from '../components/alert'
import Layout from '../components/layout'
import { getReportPdfUrl, getUploadImageSignedUrl, uploadImageBySignedUrl } from '../services/api'

type Progress = {
  percent: number,
  variant: 'success' | 'info' | 'warning' | 'danger',
  message?: string
}
const Index = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<Progress>({
    percent: 0,
    variant: 'info',
  })

  async function onUpload() {
    setIsLoading(true)
    setProgress(prev => ({
      ...prev,
      percent: 10,
      message: `Uploading images...`
    }))
    try {
      const fileInput = document.getElementById('formFile')
      if (fileInput instanceof HTMLInputElement) {
        const files = fileInput?.files
        if (!files) return null

        /**Upload */
        let promises = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          const promise = getUploadImageSignedUrl(file?.name || '')
            .then(res => uploadImageBySignedUrl(res.url, file))

          promises.push(promise)
        }
        await Promise.all(promises)

        setProgress(prev => ({
          ...prev,
          percent: 50,
          message: 'Generating report...'
        }))

        /**Generate and download report */
        const previewReportUrl = `${window.location.origin}/print`
        const downloadPdfUrl = getReportPdfUrl(previewReportUrl)
        window.location.href = downloadPdfUrl

        setTimeout(() => {
          setProgress(prev => ({
            ...prev,
            percent: 90,
            message: 'Your report should be downloaded soon...'
          }))
        }, 2 * 1000)

        setTimeout(() => {
          setIsLoading(false)
          setProgress(prev => ({
            ...prev,
            progress: 0,
            message: ''
          }))
        }, 20 * 1000)
      }
    }
    catch (err) {

      setProgress(prev => ({
        ...prev,
        variant: 'danger'
      }))
      ErrorAlert(err?.toString() || 'Something went wrong')
    }
  }


  return (
    <Layout>
      <div
        style={{
          marginTop: '50%',
          textAlign: 'center'
        }}
      >
        {
          isLoading ? (
            <ProgressBar now={progress?.percent} variant={progress?.variant} animated={progress?.percent < 100} />
          ) : (
            <Form.Group
              onChange={e => onUpload()}
              controlId="formFile"
              className="mb-3">
              <Form.Control
                multiple
                type="file" size="lg" />
            </Form.Group>
          )
        }
        <p>{progress?.message}</p>
      </div>
    </Layout>
  )
}

export default Index
