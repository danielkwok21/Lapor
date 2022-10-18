// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteVideo, getVideoUrl } from '../../../services/linode'
import redisClient, { REDIS_KEYS } from '../../../services/redis'
import { log } from '../../../services/util'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const fileName = req.query.fileName?.toString() || ''

    switch (req.method) {
        case 'GET':
            const { url } = await getVideoUrl(fileName)

            res.json({
                url
            })
            break
        case 'DELETE':
            try {

                if (!fileName) throw new Error(`Missing fileName`)
                log.normal(`Deleting request for fileName="${fileName}"`)

                let promises = []

                promises.push(deleteVideo({ fileName: fileName }))

                log.normal(`Deleting thumbnail and video...`)
                await Promise.all(promises)
                log.normal(`...Deleting thumbnail and video`)

                log.normal(`Clearing cache...`)
                await redisClient.del(REDIS_KEYS.videos)
                log.normal(`...Clearing cache`)

                res.json({
                    success: true,
                    video: fileName
                })
            } catch (err) {
                res.status(400).json({
                    success: false,
                    message: err?.toString()
                })
            }
            break
    }
}

