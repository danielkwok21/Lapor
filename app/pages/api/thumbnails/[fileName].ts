// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getThumbnailUrl } from '../../../services/linode'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            try {
                const fileName = req.query.fileName?.toString()
                if (!fileName) throw new Error(`Missing fileName`)

                const url = getThumbnailUrl(fileName)
                res.json({ url })

            } catch (err) {
                res.status(400).json({
                    success: false,
                    message: err?.toString()
                })
            }
    }
}

