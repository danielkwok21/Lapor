import { useState } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import { ErrorAlert, SuccessAlert } from '../components/alert'
import Layout from '../components/layout'
import { getReportPdfUrl, getUploadImageSignedUrl, uploadImageBySignedUrl } from '../services/api'


const Index = () => {
  const [isLoading, setIsLoading] = useState(false)

  async function onUpload() {
    setIsLoading(true)
    const fileInput = document.getElementById('formFile')
    if (fileInput instanceof HTMLInputElement) {
      const files = fileInput?.files
      if (!files) return null

      /**Upload */
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {

          const { url } = await getUploadImageSignedUrl(file?.name || '')

          await uploadImageBySignedUrl(url, file)
        }
        catch (err) {

          ErrorAlert(err?.toString() || 'Something went wrong')
        }
      }

      /**Generate and download report */
      const previewReportUrl = `${window.location.origin}/print`
      const downloadPdfUrl = getReportPdfUrl(previewReportUrl)
      var link = document.createElement('a');
      link.href = downloadPdfUrl;
      link.download = "report.pdf";
      link.click();
    }

    setIsLoading(false)
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
            <Spinner animation='border' />
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
      </div>
    </Layout>
  )
}

export default Index
