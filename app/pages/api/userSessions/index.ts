// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import redisClient, { REDIS_KEYS } from '../../../services/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      const sessions = await redisClient.hGetAll(REDIS_KEYS.userSessions)
      Object.keys(sessions).map(userId => {
          sessions[userId] = JSON.parse(sessions[userId])
      })
      res.json({
          success: true,
          sessions: sessions
      })
  }
}

