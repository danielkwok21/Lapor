import { useEffect, useState } from 'react'
import { GetAllVideosResponse } from '../services/api'
import Home from './home'
import MobileHome from './home.mobile'

type Props = {
  getAllVideosResponse?: GetAllVideosResponse,
}

const Index = (props: Props) => {

  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 500)
  }, [])

  if (isMobile) {
    return <MobileHome />
  } else {
    return <Home />
  }
}

export default Index
