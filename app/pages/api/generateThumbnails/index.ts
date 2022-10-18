// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { generateAndUploadThumbnails } from '../../../services/lambda'
import { getUploadImageSignedURL, getImageUrl } from '../../../services/linode'
import redisClient, { REDIS_KEYS } from '../../../services/redis'
import { log } from '../../../services/util'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':

      try {
        let { fileName } = req.body

        /**1. Get video url */
        log.normal(`generating thumbnails...`)
        const { url } = await getImageUrl(fileName)

        /**2. Generate thumbnails via lambda*/
        const response = await generateAndUploadThumbnails({
          url: url,
          fileName: req.body.fileName?.replaceAll(" ", "_"),
        })
        if (!response.success) throw response.message
        log.normal(`...generating thumbnails`)

        /**3. Clear cache */
        log.normal(`clearing cache...`)
        await redisClient.del(REDIS_KEYS.images)
        log.normal(`...clearing cache`)

        res.json({
          success: true,
          videoUrl: url,
          thumbnails: response.data.map(d => d.uri)
        })
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err?.toString()
        })
      }
  }
}

