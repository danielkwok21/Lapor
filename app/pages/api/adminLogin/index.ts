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

      try {
        const {
          password, userId
        } = req.body

        if (!password) throw new Error('Password is empty')
        if (!userId) throw new Error('User id is empty')
        if (password !== config.ADMIN_PASSWORD) throw new Error(`Wrong password`)

        await redisClient.hSet(REDIS_KEYS.adminSessions, userId, JSON.stringify({
          loggedInAt: Date.now(),
          headers: req.headers
        }))

        res.json({
          success: true
        })
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err?.toString()
        })
      }

  }
}

