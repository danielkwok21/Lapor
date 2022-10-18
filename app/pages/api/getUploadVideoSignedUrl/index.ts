// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getUploadVideoSignedURL } from '../../../services/linode'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':

      try {
        const { fileName } = req.body

        const response = await getUploadVideoSignedURL('video/mp4', fileName)

        res.json(response)
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err?.toString()
        })
      }
  }
}

