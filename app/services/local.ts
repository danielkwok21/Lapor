export enum LocalKeys {
    userId = 'userId'
}

export function getOrGenerateUserId() {
    let userId = localStorage.getItem(LocalKeys.userId)
    if (!userId) {
        userId = `${(Math.random() * 1000000000).toFixed(0)}_${Date.now()}`
        localStorage.setItem(LocalKeys.userId, userId)
    }

    return userId
}