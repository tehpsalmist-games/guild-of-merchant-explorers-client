import { gql } from '@apollo/client'
import { GOME_ID } from '../data/get-a-room'

export const GET_GAME = gql`
  query GetGame ($userId: uuid!) {
    game_by_pk(id: "${GOME_ID}") {
      id
      name
      players(where: { player_id: {_eq: $userId } }) {
        id
        player_id
      }
    }
  }
`

export const GET_ROOMS = gql`
  subscription GetRooms {
    room(where: { game_id: { _eq: "${GOME_ID}" } }, order_by: { created_at: desc }) {
      id
      name
      is_public
      host_id
      members {
        id
        player_id
        invite_accepted
      }
    }
  }
`

export const GET_HOSTED_ROOM_NAMES = gql`
  query HostedRooms ($hostId: uuid!) {
    room(where: { game_id: { _eq: "${GOME_ID}" }, host_id: { _eq: $hostId } }, order_by: { created_at: desc }) {
      id
      name
    }
  }
`

export const PLAYER_LIST = gql`
  query PlayerList {
    game_player (where: { game_id: {_eq: "${GOME_ID}" } }, order_by: { player: { displayName: asc } }) {
      id
      player {
        id
        displayName
        avatarUrl
      }
    }
  }
`

export const STREAM_NEW_PLAYERS = gql`
  subscription StreamNewPlayers($latestId: Int!) {
    game_player_stream(
      where: { game_id: { _eq: "${GOME_ID}" } }
      cursor: { initial_value: { id: $latestId } }
      batch_size: 4
    ) {
      id
      player {
        id
        displayName
        avatarUrl
      }
    }
  }
`

export const GAME_NOTIFICATIONS = gql`
  query GameNotifications($userId: uuid!) {
    game_player_notification(where: { game_id: { _eq: "${GOME_ID}" }, user_id: { _eq: $userId } }) {
      id
      message
      ack
      created_at
    }
  }
`

export const STREAM_NOTIFICATIONS = gql`
  subscription StreamNotifications($userId: uuid!, $latestId: Int!) {
    game_player_notification_stream(
      where: { game_id: { _eq: "${GOME_ID}" }, user_id: { _eq: $userId } }
      cursor: { initial_value: { id: $latestId } }
      batch_size: 1
    ) {
      id
      message
      ack
      created_at
    }
  }
`
