// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import redisClient, { REDIS_KEYS } from '../../../services/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      try {

        const userId: string = req.query.userId?.toString() || ''
        if (!userId) throw new Error(`Missing user id`)

        const ADMIN_LOGIN_STATE = await redisClient.hGet(REDIS_KEYS.adminSessions, userId)
        res.json({
          isAdminLoggedIn: ADMIN_LOGIN_STATE ? true : false
        })
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err?.toString()
        })
      }
  }
}

