const GREEN_COLOR = '\x1b[32m%s\x1b[0m'
const YELLOW_COLOR = '\x1b[33m%s\x1b[0m'
const RED_COLOR = '\x1b[31m%s\x1b[0m'

export const log = {
    normal: (string: any) => {
        console.log(GREEN_COLOR, '[log]', string)
    },
    warning: (string: any) => {
        console.log(YELLOW_COLOR, '[log]', string)
    },
    fatal: (string: any) => {
        console.log(RED_COLOR, '[log]', string)
    },
}