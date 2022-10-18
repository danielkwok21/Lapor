import { getAll, getThumbnailUrl, listVideos } from "./linode"
import redisClient, { REDIS_KEYS } from "./redis"

const GREEN_COLOR = '\x1b[32m%s\x1b[0m'
const YELLOW_COLOR = '\x1b[33m%s\x1b[0m'
const RED_COLOR = '\x1b[31m%s\x1b[0m'

export const log = {
    normal: (string: any) => {
        console.log(GREEN_COLOR, '[log]', string)
    },
    warning: (string: any) => {
        console.log(YELLOW_COLOR, '[log]', string)
    },
    fatal: (string: any) => {
        console.log(RED_COLOR, '[log]', string)
    },
}


type InfoByVideoName = {
    [key: string]: Info
}
type Info = {
    name: string,
    thumbnails: {
        name: string,
        url: string,
    }[],
}
export async function getInfoByVideoName(): Promise<InfoByVideoName> {

    let videos: any[] | undefined
    videos = await redisClient.get(REDIS_KEYS.videos).then(res => res ? JSON.parse(res) : res)

    if (!videos) {
        log.warning('videos cache miss')
        const results = await getAll(listVideos, 'listVideos')

        await redisClient.set(REDIS_KEYS.videos, JSON.stringify(results))
        videos = results
    } else {
        log.normal('videos cache hit')
    }

    const thumbnailNames: string[] = []
    videos.forEach(video => {
        const NUMBER_OF_THUMBNAILS = 10
        for (let i = 1; i <= NUMBER_OF_THUMBNAILS; i++) {
            const videoNameWithoutSpace = video.name.replaceAll(' ', '_')
            thumbnailNames.push(`${videoNameWithoutSpace}_${i}.jpg`)
        }
    })

    const infoByVideoName: InfoByVideoName = {}

    videos.forEach(video => {
        const videoNameWithoutSpace = video.name.replaceAll(' ', '_')
        const info: Info = {
            name: video.name,
            thumbnails: []
        }
        const relatedThumbnails = thumbnailNames
            .filter(n => {
                const thumbnailNameWithoutSpace = n.replaceAll(' ', '_')
                const isMatch = thumbnailNameWithoutSpace.includes(videoNameWithoutSpace)
                return isMatch
            })

        info.thumbnails = relatedThumbnails.map(t => {
            return {
                name: t,
                url: getThumbnailUrl(t),
            }
        })

        infoByVideoName[video.name] = info
    })

    return infoByVideoName
}