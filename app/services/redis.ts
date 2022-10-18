import { createClient } from 'redis'
import config from '../config'
import { log } from './util'
const redisClient = createClient(
    {
        url: config.REDIS_URL
    }
)

redisClient
    .connect()
    .then(() => {
        log.normal(`Redis client ready`)
    })

redisClient
    .on('error', err => log.fatal(err))

export default redisClient

export enum REDIS_KEYS {
    images = 'images',
    userSessions = 'userSessions',
    adminSessions = 'adminSessions'
}