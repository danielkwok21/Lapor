// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getImageUrl, listImages } from '../../../services/linode'
import redisClient, { REDIS_KEYS } from '../../../services/redis'
import { log } from '../../../services/util'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            try {
                let imageUrls: string[] = await redisClient.get(REDIS_KEYS.images).then(res => res ? JSON.parse(res) : res)

                if (!imageUrls) {
                    log.warning(`Image cache miss`)
                    const images = await listImages()
                    const promises = images.data.map(image => {
                        return getImageUrl(image.name)
                            .then(res => res.url)
                    })
                    imageUrls = await Promise.all(promises)
                    await redisClient.set(REDIS_KEYS.images, JSON.stringify(imageUrls))
                } else {
                    log.normal(`Image cache hit`)
                }

                res.json(imageUrls)
            } catch (err) {
                res.status(400).send(err)
            }
    }
}

