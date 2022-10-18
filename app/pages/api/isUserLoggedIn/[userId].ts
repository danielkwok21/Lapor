// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import redisClient, { REDIS_KEYS } from '../../../services/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      const userId: string = req.query.userId?.toString() || ''
      const USER_LOGIN_STATE = await redisClient.hGet(REDIS_KEYS.userSessions, userId)
      res.json({
        isUserLoggedIn: USER_LOGIN_STATE ? true : false
      })
  }
}

