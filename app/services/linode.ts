import { Credentials } from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';

import moment from 'moment';
import config from '../config';
import { log } from './util';

const LINODE_CONFIG = {
    CLUSTER_ID: config.LINODE_CLUSTER_ID,
    IMAGE_BUCKET_NAME: config.LINODE_OBJECT_STORAGE_IMAGE_BUCKET_NAME,
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

export const listImages = (): Promise<ListBucketObjectsResponse> => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.IMAGE_BUCKET_NAME}/object-list`, {
        method: 'GET',
        headers: headers
    })
        .then(res => res.json())
        .then((res: ListBucketObjectsResponse) => {
            if (res.errors) {
                log.fatal(res.errors)
            }
            const newData = res.data.sort((a, b) => moment(b.last_modified).diff(moment(a.last_modified)))
            res.data = newData
            return res
        })
}

type GetImageUrlResponse = {
    url: string
}
export const getImageUrl = (name: string): Promise<GetImageUrlResponse> => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.IMAGE_BUCKET_NAME}/object-url`, {
        method: 'post',
        headers: headers,
        body: JSON.stringify({
            method: 'GET',
            name: name
        })
    })
        .then(res => res.json())
}

export const getThumbnailUrl = (name: string): string => {
    return `https://${LINODE_CONFIG.IMAGE_BUCKET_NAME}.${LINODE_CONFIG.CLUSTER_ID}.linodeobjects.com/${name}`
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

/**Delete one single video by fileName */
type DeleteVideoRequest = {
    fileName: string
}
export async function deleteImage({ fileName }: DeleteVideoRequest) {
    const params: S3.DeleteObjectRequest = {
        Bucket: LINODE_CONFIG.IMAGE_BUCKET_NAME || '',
        Key: fileName,
    };

    return s3Client.deleteObject(params).promise()
}

const getVideoImageSignedUrl = (name: string): Promise<{ url: string }> => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.IMAGE_BUCKET_NAME}/object-url`, {
        method: 'post',
        headers: headers,
        body: JSON.stringify({
            method: 'GET',
            name: name
        })
    })
        .then(res => res.json())
}

export const getUploadImageSignedURL = (content_type: string, name: string): Promise<{ url: string }> => {
    return fetch(`${LINODE_CONFIG.API_ROOT}/object-storage/buckets/${LINODE_CONFIG.CLUSTER_ID}/${LINODE_CONFIG.IMAGE_BUCKET_NAME}/object-url`, {
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