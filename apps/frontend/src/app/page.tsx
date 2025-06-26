'use client'

import VideosContainer from '@/components/Videos/VideosContainer'
import { getUserToken } from '@/helper/userToken'
import { currentKnowledgeRoomAtom } from '@/state/jotai'
import { IconLibrary } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'

export default function Home() {
    const [userToken, setUserToken] = useState<string>('')

    const [currentKnowledgeRoom] = useAtom(currentKnowledgeRoomAtom)

    useEffect(() => {
        setUserToken(getUserToken())
    }, [])

    return (
        <div className="bg-white/10 my-8 mr-8 w-full rounded-2xl p-8 flex flex-col gap-8">
            <h1 className="text-2xl font-bold h-[32px]">
                {currentKnowledgeRoom?.title}
            </h1>
            <main className="flex gap-8 overflow-hidden">
                {false && (
                    <div className="flex flex-col gap-4 justify-center py-40 text-center">
                        <IconLibrary size={100} className="m-auto" />
                        <div className="text-xl font-bold">
                            Nice to see you!
                        </div>
                        <div className="text-md text-white">
                            Start by creating your first Knowledge Room on the
                            left-hand side.
                        </div>

                        <div className="text-sm text-white/60">
                            User ID: {userToken}
                        </div>
                    </div>
                )}
                <VideosContainer />
            </main>
        </div>
    )
}
