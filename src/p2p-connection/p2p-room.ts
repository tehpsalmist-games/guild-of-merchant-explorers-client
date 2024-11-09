import { NhostClient } from '@nhost/react'
import { P2PConnection } from './p2p-connection'
import { ApolloClient } from '@apollo/client'

interface Room {
  id: number
  name: string
  host_id: string
  created_at: string
  is_public: boolean
  members: {
    id: number
    invite_accepted: boolean
    player_id: string
  }[]
}

export class P2PRoom implements Room {
  connections: Map<number, P2PConnection> = new Map()
  id: number
  name: string
  host_id: string
  created_at: string
  is_public: boolean
  members: { id: number; invite_accepted: boolean; player_id: string }[]

  myId: number

  constructor(room: Room, userId: string, nhost: NhostClient, apollo: ApolloClient<any>) {
    this.id = room.id
    this.name = room.name
    this.host_id = room.host_id
    this.created_at = room.created_at
    this.is_public = room.is_public
    this.members = room.members ?? []

    this.myId = this.members.find((m) => m.player_id === userId)?.id ?? 0

    if (!this.myId) {
      throw new Error('Room Member Identification not found')
    }

    for (const member of this.members) {
      if (member.id === this.myId || !member.invite_accepted) continue

      this.connections.set(member.id, new P2PConnection(this.myId, member.id, this.id, nhost, apollo))
    }
  }

  destroy() {
    for (const [_memberId, connection] of this.connections.entries()) {
      connection.destroy()
    }
  }
}
