import React, { ComponentProps, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Main } from '../design-system/Main'
import { useAuthSubscription } from '@nhost/react-apollo'
import { ROOM_SUB } from '../graphql/queries'
import { Loading } from './Loading'
import { usePlayerList } from '../hooks/usePlayerList'
import { CheckCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { P2PRoom } from '../p2p-connection/p2p-room'
import { useNhostClient, useUserId } from '@nhost/react'
import { useApolloClient } from '@apollo/client'
import { Button, copyText, TextArea } from '@8thday/react'
import { P2PConnection } from '../p2p-connection/p2p-connection'

export interface GameRoomProps extends ComponentProps<'main'> {}

export const GameRoom = ({ className = '', ...props }: GameRoomProps) => {
  const [p2pRoom, setP2PRoom] = useState<P2PRoom>()
  const nhost = useNhostClient()
  const apollo = useApolloClient()

  const { roomId } = useParams()

  const userId = useUserId()

  const { userLookup } = usePlayerList()
  const { data } = useAuthSubscription(ROOM_SUB, { variables: { roomId } })

  const room = data?.room_by_pk

  useEffect(() => {
    if (room && userId && nhost && apollo) {
      setP2PRoom(new P2PRoom(room, userId, nhost, apollo))
    }
  }, [room])

  if (!room) {
    return (
      <Main>
        <Loading />
      </Main>
    )
  }

  return (
    <Main className={`${className}`} {...props}>
      <h3 className="text-center text-primary-500">{room.name}</h3>
      <div className="p-2">
        <h3 className="text-gray-600">Players</h3>
        <ul className="max-w-fit">
          {room.members.map((m) => (
            <li key={m.player_id} className="flex items-center">
              <span className="mr-4">{userLookup[m.player_id]?.displayName}</span>
              {m.invite_accepted ? (
                <CheckCircleIcon className="ml-auto h-5 w-5 text-green-500" />
              ) : (
                <QuestionMarkCircleIcon className="ml-auto h-5 w-5 animate-pulse text-yellow-500" />
              )}
            </li>
          ))}
        </ul>
      </div>
      {p2pRoom && [...p2pRoom.connections].map(([id, conn]) => <P2PConversation key={id} connection={conn} />)}
    </Main>
  )
}

const P2PConversation = ({ connection }: { connection: P2PConnection }) => {
  const [handshakeState, setHandshakeState] = useState(connection.handshakeState)
  const [chatMessages, setChatMessages] = useState<string[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const messageListener = (message: string) => {
      setChatMessages((cms) => [...cms, message])
    }
    const stateListener = (state: typeof connection.handshakeState) => setHandshakeState(state)
    const streamListener = (stream: MediaStream) => {
      console.log('stream', stream)
      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      videoRef.current.play()
    }

    connection.on('message', messageListener)
    connection.on('handshake-state', stateListener)
    connection.on('stream', streamListener)

    return () => {
      connection.off('handshake-state', stateListener)
      connection.off('message', messageListener)
      connection.off('stream', streamListener)
    }
  }, [connection])

  return (
    <div className="p-2">
      <p>Member ID: {connection.memberId}</p>
      State: {handshakeState}
      <Button
        variant="primary"
        onClick={async () => {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

          connection.peer.addStream(mediaStream)
        }}
      >
        Connect Audio
      </Button>
      <video ref={videoRef} autoPlay />
      <TextArea
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            const msg = e.currentTarget.value
            connection.sendMessage(JSON.stringify({ type: 'text-message', data: msg }))
            setChatMessages((cms) => [...cms, msg])
            e.currentTarget.value = ''
          }
        }}
      />
      <ul>
        {chatMessages.map((msg) => (
          <li className="px-2 py-1 even:bg-gray-50" key={msg}>
            {msg}
          </li>
        ))}
      </ul>
    </div>
  )
}
