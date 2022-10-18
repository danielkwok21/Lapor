// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getUploadImageSignedURL } from '../../../../services/linode'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const fileName = req.query.fileName?.toString() || ''

    switch (req.method) {
        case 'GET':
            const { url } = await getUploadImageSignedURL('video/mp4', fileName)
            res.json({ url })
    }
}

