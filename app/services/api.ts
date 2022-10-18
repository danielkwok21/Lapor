import config from "../config"
import { getOrGenerateUserId } from "./local"

const headers = {
    'Content-Type': 'application/json',
}

const apiPath = `${config.URL}/api`

export type GetAllVideosResponse = {
    [key: string]: {
        name: string,
        duration?: number,
        thumbnails: {
            name: string,
            url: string,
        }[]
    }
}
export function getAllVideos(): Promise<GetAllVideosResponse> {
    return fetch(`${apiPath}/videos`)
        .then(res => res.json())
}

export type GetVideoUrlResponse = {
    url: string
}
export function getVideoUrl(videoName?: string): Promise<GetVideoUrlResponse> {
    return fetch(`${apiPath}/videos/${videoName}`)
        .then(res => res.json())
}

export type GetIsUserLoggedInResponse = {
    isUserLoggedIn: boolean
}
export function getIsUserLoggedIn(): Promise<GetIsUserLoggedInResponse> {
    const userId = getOrGenerateUserId()
    return fetch(`${apiPath}/isUserLoggedIn/${userId}`)
        .then(res => res.json())
}

export type GetIsAdminLoggedInResponse = {
    isAdminLoggedIn: boolean
}
export function getIsAdminLoggedIn(): Promise<GetIsAdminLoggedInResponse> {
    const userId = getOrGenerateUserId()
    return fetch(`${apiPath}/isAdminLoggedIn/${userId}`)
        .then(res => res.json())
}

export function userLogout() {
    const userId = getOrGenerateUserId()
    return fetch(`${apiPath}/userLogout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            userId: userId
        })
    })
        .then(res => res.json())
}

export function adminLogout() {
    const userId = getOrGenerateUserId()
    return fetch(`${apiPath}/adminLogout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            userId: userId
        })
    })
        .then(res => res.json())
}

export type UserLoginResponse = {
    success: boolean,
    message?: string
}
export function userLogin(password: string): Promise<UserLoginResponse> {
    const userId = getOrGenerateUserId()
    return fetch(`${apiPath}/userLogin`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            password: password,
            userId: userId,
        })
    })
        .then(res => res.json())
}

export type AdminLoginResponse = {
    success: boolean,
    message?: string
}
export function adminLogin(password: string): Promise<AdminLoginResponse> {
    const userId = getOrGenerateUserId()
    return fetch(`${apiPath}/adminLogin`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            password: password,
            userId: userId,
        })
    })
        .then(res => res.json())
}

export type GetUploadVideoSignedUrlResponse = {
    url: string
}
export function getUploadVideoSignedUrl(fileName: string): Promise<GetUploadVideoSignedUrlResponse> {
    return fetch(`${apiPath}/getUploadVideoSignedUrl`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fileName: fileName
        })
    })
        .then(res => res.json())
}

export function uploadVideoBySignedUrl(url: string, file: File): Promise<any> {
    return fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': 'video/mp4'
        }
    })
        .then(res => res.text())
}

export type GenerateVideoThumbnailsResponse = {
    url: string
}
export function generateVideoThumbnails(fileName: string,): Promise<GenerateVideoThumbnailsResponse> {
    return fetch(`${apiPath}/generateThumbnails`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fileName: fileName
        })
    })
        .then(res => res.json())
}

export type DeleteVideoResponse = {
    success: boolean,
    video: string
}
export function deleteVideo(fileName: string,): Promise<DeleteVideoResponse> {
    return fetch(`${apiPath}/videos/${fileName}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fileName: fileName
        })
    })
        .then(res => res.json())
}

export type GetUserSessionsResponse = {
    success: boolean,
    sessions: {
        [key: string]: {
            loggedInAt: string,
            headers: {
                host: string,
                ['user-agent']: string,
            }
        }
    }
}
export function getUserSessions(): Promise<GetUserSessionsResponse> {
    return fetch(`${apiPath}/userSessions/`)
        .then(res => res.json())
}

export type ClearCacheResponse = {
    success: boolean,
}
export function clearCache(): Promise<ClearCacheResponse> {
    return fetch(`${apiPath}/clearCache/`, {
        method: 'POST'
    })
        .then(res => res.json())
}

export function fakeApi(body: any) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(body)
        }, 3 * 1000)
    })
}