let alertCount = 0
export function SuccessAlert(message: string) {
  alertCount++

  const span = document.createElement('span')
  span.innerHTML = message
  Object.assign(span.style, {
    position: 'absolute',
    color: '#498056',
    bottom: `${10 + (90 * (alertCount - 1))}px`,
    zIndex: 999,
    right: '10px',
    borderRadius: 10,
    backgroundColor: '#d4edda',
    textAlign: "center",
    width: '200px',
  })
  span.classList.add('alert',)
  const body = document.getElementsByTagName('body')[0]
  body.prepend(span)

  setTimeout(() => {
    alertCount--
  }, 2*1000)

  setTimeout(() => {
    span.remove()
  }, 3 * 1000)
}

export function WarningAlert(message: string) {
  alertCount++

  const span = document.createElement('span')
  span.innerHTML = message
  Object.assign(span.style, {
    position: 'absolute',
    color: '#a88d3e',
    bottom: `${10 + (90 * (alertCount - 1))}px`,
    zIndex: 999,
    right: '10px',
    borderRadius: 10,
    backgroundColor: '#fff3cd',
    textAlign: "center",
    width: '200px',
  })
  span.classList.add('alert',)
  const body = document.getElementsByTagName('body')[0]
  body.prepend(span)

  setTimeout(() => {
    alertCount--
  }, 2*1000)

  setTimeout(() => {
    span.remove()
  }, 3 * 1000)
}

export function ErrorAlert(message: string) {
  alertCount++

  const span = document.createElement('span')
  span.innerHTML = message
  Object.assign(span.style, {
    position: 'absolute',
    color: '#a36066',
    bottom: `${10 + (90 * (alertCount - 1))}px`,
    zIndex: 999,
    right: '10px',
    borderRadius: 10,
    backgroundColor: '#f8d7da',
    textAlign: "center",
    width: '200px',
  })
  span.classList.add('alert',)
  const body = document.getElementsByTagName('body')[0]
  body.prepend(span)

  setTimeout(() => {
    alertCount--
  }, 2*1000)

  setTimeout(() => {
    span.remove()
  }, 3 * 1000)
}