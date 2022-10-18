import React, { useEffect, useState } from 'react'
import { getAllImageUrls } from '../../services/api'

export default function Print(props: {
    imageUrls: string[]
}) {


    return (
        <div
            style={{
                padding: 10
            }}
        >
            <div
                style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                }}>
                <p><span >COURSE NAME</span></p>
                <p><strong>REPORT TITLE</strong></p>
                <p>LOREM IPSUM DOLOR SIT AMET</p>
                <h1>Introduction</h1>
                <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan.</p>
                <h1>...and here are some awesome images</h1>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 20,
                    }}
                >
                    {
                        props.imageUrls?.map(image => {
                            return (
                                <img
                                    key={image}
                                    src={image}
                                    height={'auto'}
                                    width={300}
                                />
                            )
                        })
                    }
                </div>
            </div>
            <div
                style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                }}>
                <h2>Lorem ipsum</h2>
                <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius.</p>
                <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>

            </div>
            <div
                style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                }}><h3>Dolor sit amet</h3>
                <p>Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan.</p>
            </div>
        </div>
    )
}

export async function getServerSideProps(context: any) {

    const imageUrls = await getAllImageUrls()

    return {
        props: {
            imageUrls: imageUrls
        }
    }
}
