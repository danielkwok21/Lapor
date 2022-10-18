import config from '../config'

const headers = {
    'Content-Type': 'application/json',
}

type Request = {
    url: string,
    fileName: string,
}
export const generateAndUploadThumbnails = ({ url, fileName }: Request): Promise<{
    body: {
        url: string,
    },
    data: {
        uri: string,
        exists: boolean
    }[],
    size: number,
    success: boolean,
    message?: string
}> => {
    return fetch(`${config.GCLOUD_FUNCTION_PROCESS_VIDEO_URL}/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            url: url,
            fileName: fileName,
        })
    })
        .then(res => res.json())
}