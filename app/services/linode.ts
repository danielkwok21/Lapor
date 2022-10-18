import { Credentials } from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';

import moment from 'moment';
import { exit } from 'process';
import config from '../config';
import { log } from './util';

const LINODE_CONFIG: {
    [key: string]: string | undefined
} = {
    CLUSTER_ID: config.LINODE_CLUSTER_ID,
    VIDEO_BUCKET_NAME: config.LINODE_OBJECT_STORAGE_VIDEO_BUCKET_NAME,
    THUMBNAIL_BUCKET_NAME: config.LINODE_OBJECT_STORAGE_THUMBNAIL_BUCKET_NAME,
    API_ROOT: config.LINODE_API_BASE_URL,
    LINODE_ACCESS_TOKEN: config.LINODE_ACCESS_TOKEN,
    LINODE_OBJECT_STORAGE_ACCESS_KEY: config.LINODE_OBJECT_STORAGE_ACCESS_KEY,
    LINODE_OBJECT_STORAGE_SECRET_KEY: config.LINODE_OBJECT_STORAGE_SECRET_KEY,
}

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${LINODE_CONFIG.LINODE_ACCESS_TOKEN}`
}

export const viewAccount = () => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/account`, {
        method: 'GET',
        headers: headers
    })
        .then(res => res.json())
}

export const listBuckets = () => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets`, {
        method: 'GET',
        headers: headers
    })
        .then(res => res.json())
}

export const listClusters = () => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/clusters`, {
        method: 'GET',
        headers: headers
    })
        .then(res => res.json())
}

type BucketObjects = {
    name: string,
    size: number,
    last_modified: string,
    etag: string,
    owner: string,
}
type ListBucketObjectsResponse = {
    data: BucketObjects[],
    errors?: {
        reason: string
    }[]
}

export const listVideos = (): Promise<ListBucketObjectsResponse> => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.VIDEO_BUCKET_NAME}/object-list`, {
        method: 'GET',
        headers: headers
    })
        .then(res => res.json())
        .then((res: ListBucketObjectsResponse) => {
            if(res.errors){
                log.fatal(res.errors)
            }
            const newData = res.data.sort((a, b) => moment(b.last_modified).diff(moment(a.last_modified)))
            res.data = newData
            return res
        })
}

type GetVideoUrlResponse = {
    url: string
}
export const getVideoUrl = (name: string): Promise<GetVideoUrlResponse> => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.VIDEO_BUCKET_NAME}/object-url`, {
        method: 'post',
        headers: headers,
        body: JSON.stringify({
            method: 'GET',
            name: name
        })
    })
        .then(res => res.json())
}

export const listThumbnails = (marker?: string): Promise<ListBucketObjectsResponse> => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.THUMBNAIL_BUCKET_NAME}/object-list/?marker=${marker}`, {
        method: 'GET',
        headers: headers
    })
        .then(res => res.json())
}

export const getThumbnailUrl = (name: string): string => {
    return `https://${LINODE_CONFIG.THUMBNAIL_BUCKET_NAME}.${LINODE_CONFIG.CLUSTER_ID}.linodeobjects.com/${name}`
}


export const getAll = async (func: Function, label: string) => {
    let objects: BucketObjects[] = []
    let is_truncated = true
    let marker = ''
    let i = 0
    while (is_truncated && i < 5) {
        try {

            const response = await func(marker)
            objects = [...objects, ...response.data]

            if (response.is_truncated) {
                is_truncated = true
                marker = response.next_marker
            } else {
                is_truncated = false
            }
            i++
            console.log({
                receivedSoFar: objects.length,
                iteration: i,
                first: objects[0],
                marker: marker,
                label: label
            })
        } catch (err) {
            console.error(err)
            break
        }
    }
    return objects
}

/**
 * Guides
 * https://boobo94.medium.com/linode-object-storage-usage-in-nodejs-11e6dd14d2d0
 * https://www.linode.com/docs/products/storage/object-storage/guides/s3cmd/
 */
const s3Client = new S3({
    region: LINODE_CONFIG.CLUSTER_ID,
    endpoint: `https://${LINODE_CONFIG.CLUSTER_ID}.linodeobjects.com`,
    sslEnabled: true,
    s3ForcePathStyle: false,
    credentials: new Credentials({
        accessKeyId: LINODE_CONFIG.LINODE_OBJECT_STORAGE_ACCESS_KEY || '',
        secretAccessKey: LINODE_CONFIG.LINODE_OBJECT_STORAGE_SECRET_KEY || '',
    }),
});

/**
 * Uploads videos to video bucket.
 * Guides:
 * https://www.youtube.com/watch?v=BmPkifIQPRc&ab_channel=BeABetterDev
 * https://www.youtube.com/watch?v=2Jq0UeqB4nw&ab_channel=BeABetterDev
 */
type UploadVideoMultipartReq = {
    buffer: Buffer,
    fileName: string,
}
export async function uploadVideoMultipart({ buffer, fileName, }: UploadVideoMultipartReq): Promise<string | undefined> {

    if (!LINODE_CONFIG.VIDEO_BUCKET_NAME) throw new Error('Missing linode config')

    try {

        /**
         * Chunk binary into parts lengths of 100 and upload
         */
        const CHUNK_SIZE = Math.pow(1024, 2) * 10 // 10 mb
        type PART_BY_PARTNUMBER = {
            [key: number]: Part
        }
        type Part = {
            ETag?: string,
            PartNumber?: number,
            chunk?: Buffer,
        }

        const detailsByPartNumber: PART_BY_PARTNUMBER = {}
        let partNumber = 1
        for (let i = 0; i < buffer.byteLength; i += CHUNK_SIZE) {
            const chunkedBuffer: Buffer = buffer.slice(i, i + CHUNK_SIZE)

            detailsByPartNumber[partNumber] = {
                PartNumber: partNumber,
                chunk: chunkedBuffer
            }
            partNumber++
        }

        /**
         * Create multipart upload
         */
        log.normal(`createMultipartUpload...`)
        const createMultipartUploadReq: S3.CreateMultipartUploadRequest = {
            Bucket: LINODE_CONFIG.VIDEO_BUCKET_NAME,
            Key: fileName,
            ACL: 'public-read',
            Metadata: {
                dummy: 'Chicken thigh'
            }
        };
        const createMultipartUploadResponse = await s3Client.createMultipartUpload(createMultipartUploadReq).promise()
        log.normal(`...createMultipartUpload`)


        /**
         * 4. Upload each part
         */
        const numberOfDetails = Object.entries(detailsByPartNumber).length

        let uploadPartResponses = []
        for (let i = 0; i < numberOfDetails; i++) {
            log.normal(`uploadPart (${i + 1}/${numberOfDetails})...`)
            const [partNumber, details] = Object.entries(detailsByPartNumber)[i]

            if (!createMultipartUploadResponse.UploadId) throw new Error(`Missing uploadId`)

            const param: S3.UploadPartRequest = {
                Body: details.chunk,
                Bucket: LINODE_CONFIG.VIDEO_BUCKET_NAME,
                Key: fileName,
                UploadId: createMultipartUploadResponse.UploadId,
                PartNumber: Number(partNumber)
            }

            const promise = s3Client.uploadPart(param).promise()
                .then(res => {
                    const result: Part = {
                        PartNumber: Number(partNumber),
                        ETag: res.ETag
                    }
                    return result
                })
                .catch(err => {
                    throw err
                })

            const response = await promise
            uploadPartResponses.push(response)
        }

        log.normal(`...uploadPart`)

        /**
         * Complete multipart upload
         */
        log.normal(`completeMultipartUpload...`)

        if (!createMultipartUploadResponse.UploadId) throw new Error(`Missing uploadId`)

        const completeMultipartUploadReq: S3.CompleteMultipartUploadRequest = {
            Bucket: LINODE_CONFIG.VIDEO_BUCKET_NAME,
            Key: fileName,
            UploadId: createMultipartUploadResponse.UploadId,
            MultipartUpload: {
                Parts: uploadPartResponses.map(r => {
                    return {
                        ETag: r.ETag,
                        PartNumber: r.PartNumber
                    }
                })
            }
        }
        const completeMultiPartUploadResponse = await s3Client.completeMultipartUpload(completeMultipartUploadReq).promise()
        log.normal(`...completeMultipartUpload`)

        return completeMultiPartUploadResponse.Location

    } catch (err) {
        console.error(err)
        throw err
    }
}

/**
 * Uploads thumbnails to thumbnails bucket.
 */
type UploadThumbnailRequest = {
    buffer: string,
    fileName: string,
    mime: string
}
export async function uploadThumbnail({ buffer, fileName, mime }: UploadThumbnailRequest): Promise<string> {
    const params: S3.PutObjectRequest = {
        Bucket: LINODE_CONFIG.THUMBNAIL_BUCKET_NAME || '',
        Key: fileName,
        Body: buffer,
        ACL: 'public-read',
        ContentType: mime
    };

    const res = await s3Client.upload(params).promise();
    return res.Location;
}

/**Delete one single video by fileName */
type DeleteVideoRequest = {
    fileName: string
}
export async function deleteVideo({ fileName }: DeleteVideoRequest) {
    const params: S3.DeleteObjectRequest = {
        Bucket: LINODE_CONFIG.VIDEO_BUCKET_NAME || '',
        Key: fileName,
    };

    return s3Client.deleteObject(params).promise()
}

/**Delete one single thumbnail by fileName */
type DeleteThumbnailRequest = {
    fileName: string
}
export async function deleteThumbnail({ fileName }: DeleteThumbnailRequest) {
    const params: S3.DeleteObjectRequest = {
        Bucket: LINODE_CONFIG.THUMBNAIL_BUCKET_NAME || '',
        Key: fileName,
    };

    return s3Client.deleteObject(params).promise()
}


type UploadVideoReq = {
    contentType: string,
    buffer: Buffer,
    fileName: string,
}
export async function uploadVideo({ contentType = 'video/mp4', fileName, buffer }: UploadVideoReq): Promise<string | undefined> {
    log.normal(`uploadVideo...`)

    try {
        log.normal(`getUploadVideoSignedURL...`)
        const res1 = await getUploadVideoSignedURL(contentType, fileName)
        log.normal(`...getUploadVideoSignedURL`)

        log.normal(`uploadVideoBySignedUrl...`)
        const res2 = await uploadVideoBySignedUrl(res1.url, buffer, contentType)
        log.normal(`...uploadVideoBySignedUrl`)

        log.normal(`updateVideoACLToPublic...`)
        const res3 = await updateVideoACLToPublic(fileName)
        log.normal(`...updateVideoACLToPublic`)

        log.normal(`getViewVideoSignedUrl...`)
        const res4 = await getViewVideoSignedUrl(fileName)
        log.normal(`...getViewVideoSignedUrl`)

        log.normal(`...uploadVideo`)

        return res4.url
    } catch (err) {
        log.fatal(err)
    }
}

const getViewVideoSignedUrl = (name: string): Promise<{ url: string }> => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.VIDEO_BUCKET_NAME}/object-url`, {
        method: 'post',
        headers: headers,
        body: JSON.stringify({
            method: 'GET',
            name: name
        })
    })
        .then(res => res.json())
}

export const getUploadVideoSignedURL = (content_type: string, name: string): Promise<{ url: string }> => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.VIDEO_BUCKET_NAME}/object-url`, {
        method: 'post',
        headers: headers,
        body: JSON.stringify({
            content_type: content_type,
            method: 'PUT',
            name: name
        })
    })
        .then(res => res.json())
}

const updateVideoACLToPublic = (fileName: string) => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.VIDEO_BUCKET_NAME}/object-acl?name=${fileName}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            acl: 'public-read',
            name: fileName
        })
    })
        .then(res => res.json())
}

const uploadVideoBySignedUrl = (url: string, buffer: Buffer, contentType: string) => {
    return fetch(url, {
        method: 'PUT',
        body: buffer,
        headers: {
            'Content-Type': contentType
        }
    })
        .then(res => res.text())
}