// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from "puppeteer";
import { deleteImage, getAll, listImages } from '../../../services/linode';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':

            try {
                let {
                    url
                } = req.query

                url = url?.toString()

                if (!url) throw new Error(`Missing url. Provided url="${url}"`)

                /**
             * 12/6/2022 daniel.kwok
             * Launches a headless browser, navigates to provided url
             * Converts html at url into pdf, and return to user
             */
                const browser = await puppeteer.launch({
                    headless: true,

                    /**
                     * 12/6/2022 daniel.kwok
                     * https://unix.stackexchange.com/questions/694734/puppeteer-in-alpine-docker-with-chromium-headless-dosent-seems-to-work
                     */
                    executablePath: "/usr/bin/chromium-browser",
                    args: [
                        "--no-sandbox",
                        "--headless",
                        "--disable-gpu",
                        "--disable-dev-shm-usage",
                    ],
                });

                const page = await browser.newPage();
                await page.goto(url, { waitUntil: "networkidle0" });
                const pdf = await page.pdf({
                    format: "A4",
                    displayHeaderFooter: true,
                    headerTemplate: '<div id="header-template" style="font-size:10px !important; color:black; padding-left:10px; text-align: right;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
                    footerTemplate: '<div id="header-template" style="font-size:10px !important; color:black; padding-left:10px; text-align: right;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
                    margin: {
                        top: '100px',
                        bottom: '200px',
                        right: '30px',
                        left: '30px',
                    },
                });
                await browser.close();

                res.setHeader("Content-Type", "application/pdf")
                res.setHeader("Content-Length", pdf.length)
                res.send(pdf);
            } catch (err) {
                res.status(400).json({
                    success: false,
                    message: err?.toString()
                })
            }

    }
}

