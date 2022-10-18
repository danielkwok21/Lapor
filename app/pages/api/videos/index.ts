// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getInfoByVideoName } from '../../../services/util'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            try {
                const infoByVideoName = await getInfoByVideoName()

                res.json(infoByVideoName)
            } catch (err) {
                res.status(400).send(err)
            }
    }
}

