'use client'

import { getUserToken } from '@/helper/userToken'
import { useEffect, useState } from 'react'

export default function Home() {
    const [userToken, setUserToken] = useState<string>('')
    
    useEffect(() => {
        setUserToken(getUserToken())
    }, [])

    return (
        <div>
            <main>{userToken}</main>
        </div>
    )
}
