// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import config from '../../../config'
import redisClient, { REDIS_KEYS } from '../../../services/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      const {
        password, userId
      } = req.body
      if (password === config.USER_PASSWORD) {
        await redisClient.hSet(REDIS_KEYS.userSessions, userId, JSON.stringify({
          loggedInAt: new Date(),
          headers: req.headers
        }))
        res.json({
          success: true
        })
      } else {
        res.status(400).json({
          success: false,
          message: `Wrong password`
        })
      }
  }
}

