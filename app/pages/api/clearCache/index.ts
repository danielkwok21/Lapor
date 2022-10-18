// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import redisClient, { REDIS_KEYS } from '../../../services/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      await redisClient.del(REDIS_KEYS.videos)
      res.json({
        success: true
      })
  }
}

