import { NhostClient } from '@nhost/react'
import SimplePeer, { SignalData } from 'simple-peer'
import { CLEANUP_HANDSHAKE_MESSAGES, SEND_P2P_MESSAGE } from '../graphql/mutations'
import { ApolloClient } from '@apollo/client'
import { LATEST_P2P_MESSAGE, P2P_MESSAGE_STREAM } from '../graphql/queries'
import { toast } from '@8thday/react'
import { EventEmitter } from 'events'

type EventMap<T> = {
  [K in keyof T]: T[K][]
}

type PeerState =
  | 'initializing'
  | 'awaiting-online-confirmation'
  | 'awaiting-offer'
  | 'generating-offer'
  | 'awaiting-answer'
  | 'generating-answer'
  | 'sent-answer'
  | 'processing-answer'
  | 'connected'
  | 'closed'
  | 'errored'

type ErrorCode =
  | 'ERR_WEBRTC_SUPPORT'
  | 'ERR_CREATE_OFFER'
  | 'ERR_CREATE_ANSWER'
  | 'ERR_SET_LOCAL_DESCRIPTION'
  | 'ERR_SET_REMOTE_DESCRIPTION'
  | 'ERR_ADD_ICE_CANDIDATE'
  | 'ERR_ICE_CONNECTION_FAILURE'
  | 'ERR_SIGNALING'
  | 'ERR_DATA_CHANNEL'
  | 'ERR_CONNECTION_FAILURE'

type AnswerSignalData = Omit<Extract<SignalData, { type: RTCSdpType }>, 'type'> & { type: 'answer' }
type OfferSignalData = Omit<Extract<SignalData, { type: RTCSdpType }>, 'type'> & { type: 'offer' }

type Message =
  | AnswerSignalData
  | OfferSignalData
  | { type: 'online' }
  | { type: 'offer-generated'; data: SignalData }
  | { type: 'error'; code?: ErrorCode }
  | { type: 'close' }

export class P2PConnection extends EventEmitter<
  EventMap<{ message: string; stream: MediaStream; 'handshake-state': PeerState }>
> {
  myId: number
  memberId: number
  roomId: number

  nhost: NhostClient
  apollo: ApolloClient<any>

  isInitiator: boolean

  handshakeState: PeerState = 'initializing'

  generatedOffer: SignalData | null = null

  peer: SimplePeer.Instance

  serverConnection: ServerConnection

  connAbortController: AbortController | null = null

  destroyed = false

  constructor(myId: number, memberId: number, roomId: number, nhost: NhostClient, apollo: ApolloClient<any>) {
    super()

    this.myId = myId
    this.memberId = memberId
    this.roomId = roomId

    this.isInitiator = this.myId < this.memberId

    this.nhost = nhost
    this.apollo = apollo

    this.serverConnection = new ServerConnection(nhost, apollo, myId, memberId, roomId)
    this.setupPeer()

    this.connect().catch((e) => {
      if (e === 'timedout') return this.reconnect()
      console.error(e)
    })
  }

  async connect() {
    if (this.connAbortController && !this.connAbortController.signal.aborted) {
      this.connAbortController.abort()
    }

    this.connAbortController = new AbortController()

    this.updateHandshakeState('awaiting-online-confirmation')

    await this.serverConnection.connectToServer()
    if (this.connAbortController.signal.aborted) return

    this.sendServerMessage({ type: 'online' })

    if (this.isInitiator) {
      const isOnline = await this.waitForPeerMessage('online')
      if (this.connAbortController.signal.aborted) return

      if (isOnline.type !== 'online') {
        throw new Error(`bad message! expected "online" and got ${isOnline.type}`)
      }

      const offer = await this.generateOffer()
      if (this.connAbortController.signal.aborted) return

      this.sendServerMessage(offer)

      const answer = await this.waitForPeerMessage('answer')
      if (this.connAbortController.signal.aborted) return

      if (answer.type !== 'answer') {
        throw new Error(`bad message! expected "answer" and got ${isOnline.type}`)
      }

      this.updateHandshakeState('processing-answer')

      this.peer.signal(answer)
    } else {
      const offer = await this.waitForOffer()
      if (this.connAbortController.signal.aborted) return

      if (offer.type !== 'offer') {
        throw new Error(`bad message! expected "offer" and got ${offer.type}`)
      }

      const answer = await this.generateAnswerFromOffer(offer)

      this.sendServerMessage(answer)
    }

    console.log('process complete, awaiting connection')
    this.connAbortController = null

    setTimeout(() => {
      if (!this.peer.connected && this.handshakeState === (this.isInitiator ? 'processing-answer' : 'sent-answer')) {
        this.reconnect()
      }
    }, 60000)
  }

  reconnect() {
    this.updateHandshakeState('initializing')
    this.setupPeer()
    this.connect().catch((e) => {
      if (e === 'timedout') {
        return this.reconnect()
      }
      console.error('trouble reconnecting', e)
    })
  }

  sendMessage(message: any) {
    this.peer.send(message)
  }

  async waitForOffer() {
    this.updateHandshakeState('awaiting-offer')

    const offerPromise = this.waitForPeerMessage('offer')

    let cleanedUp = false
    const onlinePromise = this.waitForPeerMessage('online').catch(() => {})

    onlinePromise.then(() => {
      if (cleanedUp) return

      this.sendServerMessage({ type: 'online' })
    })

    return offerPromise.then((offer) => {
      // cleanup
      cleanedUp = true

      return offer
    })
  }

  async setupPeer() {
    if (this.peer && !this.peer.destroyed) {
      this.generatedOffer = null
      this.peer.removeAllListeners()
      this.peer.destroy()
    }

    this.peer = new SimplePeer({ initiator: true })

    this.peer.setDefaultEncoding('utf-8')

    this.peer.on('data', (d) => {
      const { type, data } = this.parseIncomingData(d)
      console.log('data from', this.memberId, d)
      if (type === 'text-message') {
        this.emit('message', data)
      }
    })

    this.peer.on('connect', () => {
      this.updateHandshakeState('connected')

      this.nhost.graphql.request(CLEANUP_HANDSHAKE_MESSAGES, {
        senderId: this.myId,
        receiverId: this.memberId,
        roomId: this.roomId,
      })

      this.serverConnection.disconnectFromServer()
    })

    this.peer.on('stream', (stream) => {
      this.emit('stream', stream)
    })

    this.peer.on('signal', (data) => {
      this.sendServerMessage(data)
    })

    this.peer.on('error', (err: any) => {
      console.log('err', err.code, err)

      if (this.connAbortController && !this.connAbortController.signal.aborted) {
        this.connAbortController.abort()
      }

      if (err.code === 'ERR_ICE_CONNECTION_FAILURE') {
        this.sendServerMessage({ type: 'error', code: err.code })
      }
    })

    this.peer.on('close', () => {
      console.log('close', this.destroyed)
      if (this.destroyed) return

      this.reconnect()
    })
  }

  waitForPeerMessage<T extends Message['type']>(event: T, timeout = 30000): Promise<Extract<Message, { type: T }>> {
    return new Promise((res, rej) => {
      const timer = setTimeout(() => {
        this.serverConnection.off(event as Message['type'], eventListener)
        rej('timedout')
      }, timeout)

      const eventListener = (m) => {
        clearTimeout(timer)
        this.serverConnection.off(event as Message['type'], eventListener)
        res(m)
      }

      this.serverConnection.on(event as Message['type'], eventListener)
    })
  }

  parseIncomingData(d: Uint8Array) {
    const rawData = d.toString()

    try {
      const parsed = JSON.parse(rawData)

      switch (parsed.type) {
        case 'text-message':
          return parsed
        default:
          return { type: 'unknown-data', data: rawData }
      }
    } catch (e) {
      console.log(e, rawData)
      return { type: 'bad-data', data: rawData }
    }
  }

  updateHandshakeState(newState: PeerState) {
    this.handshakeState = newState
    this.emit('handshake-state', newState)
  }

  async generateOffer(timeout = 10000): Promise<SignalData> {
    this.updateHandshakeState('generating-offer')

    if (this.generatedOffer) {
      this.updateHandshakeState('awaiting-answer')
      return this.generatedOffer
    }

    return new Promise((res, rej) => {
      let offered = false
      const timer = setTimeout(() => {
        this.peer.off('signal', offerListener)
        this.peer.off('close', closeListener)
        rej('timedout')
      }, timeout)

      const offerListener = (data: SignalData) => {
        if (data.type === 'offer' && !offered) {
          this.peer.off('signal', offerListener)
          this.peer.off('close', closeListener)
          clearTimeout(timer)

          this.updateHandshakeState('awaiting-answer')

          offered = true
          this.generatedOffer = data
          res(data)
        }
      }

      const closeListener = () => {
        this.peer.off('signal', offerListener)
        this.peer.off('close', closeListener)
        clearTimeout(timer)

        rej('peer closed')
      }

      this.peer.on('signal', offerListener)
      this.peer.on('close', closeListener)
    })
  }

  generateAnswerFromOffer(offer: OfferSignalData, timeout = 10000): Promise<SignalData> {
    this.updateHandshakeState('generating-answer')

    return new Promise((res, rej) => {
      let answered = false
      const timer = setTimeout(() => {
        this.peer.off('signal', answerListener)
        this.peer.off('close', closeListener)
        rej('timedout')
      }, timeout)

      const answerListener = (data: SignalData) => {
        if (this.peer.connected) {
          return rej('connected')
        }

        if (data.type === 'answer' && !answered) {
          this.peer.off('signal', answerListener)
          this.peer.off('close', closeListener)
          clearTimeout(timer)

          this.updateHandshakeState('sent-answer')

          answered = true
          res(data)
        }
      }

      const closeListener = () => {
        this.peer.off('signal', answerListener)
        this.peer.off('close', closeListener)
        clearTimeout(timer)

        rej('peer closed')
      }

      this.peer.on('signal', answerListener)
      this.peer.on('close', closeListener)

      this.peer.signal(offer)
    })
  }

  sendServerMessage(message: any) {
    return this.nhost.graphql.request(SEND_P2P_MESSAGE, {
      message,
      senderId: this.myId,
      receiverId: this.memberId,
      roomId: this.roomId,
    })
  }

  destroy() {
    this.destroyed = true
    this.serverConnection.destroy()
    this.peer?.destroy()
    this.removeAllListeners()
  }
}

type EventMapForMessage = {
  [K in Message as K['type']]: Extract<Message, { type: K['type'] }>
}

class ServerConnection extends EventEmitter<EventMap<EventMapForMessage>> {
  nhost: NhostClient
  apollo: ApolloClient<any>
  myId: number
  memberId: number
  roomId: number

  serverSubscription?: { unsubscribe(): void; closed?: boolean } | null = null

  destroyed = false

  constructor(nhost: NhostClient, apollo: ApolloClient<any>, myId: number, memberId: number, roomId: number) {
    super()

    this.nhost = nhost
    this.apollo = apollo
    this.myId = myId
    this.memberId = memberId
    this.roomId = roomId

    this.connectToServer()
  }

  async connectToServer(force = false) {
    if (this.serverSubscription && !this.serverSubscription.closed) {
      if (force) {
        this.serverSubscription.unsubscribe()
      } else {
        return
      }
    }

    const { data, error } = await this.nhost.graphql.request(LATEST_P2P_MESSAGE, {
      roomId: this.roomId,
      sendingMemberId: this.memberId,
      receivingMemberId: this.myId,
    })

    if (error) {
      console.error(error)
      toast.error({
        message: `Cannot connect to member ${this.memberId}`,
        description: 'Funny thing about shaking hands...you need hands!',
      })

      return error
    }

    const latestMessage = data?.p2p_message?.[0]

    this.serverSubscription = this.apollo
      .subscribe({
        query: P2P_MESSAGE_STREAM,
        variables: {
          roomId: this.roomId,
          sendingMemberId: this.memberId,
          receivingMemberId: this.myId,
          latestId: latestMessage?.id ?? 0,
        },
      })
      .subscribe((result) => {
        if (result?.errors) {
          // handle errored state
          console.error('subscription error:', result.errors)
        }
        console.log('incoming data', JSON.stringify(data, null, 2))

        const message: Message = result?.data?.p2p_message_stream?.[0].message

        if (message?.type) {
          this.emit(message.type, message as Extract<Message, keyof typeof message.type>)
        }
      })

    return null
  }

  disconnectFromServer() {
    this.serverSubscription?.unsubscribe()
    this.serverSubscription = null
  }

  destroy() {
    this.destroyed = true
    this.serverSubscription?.unsubscribe()
    this.serverSubscription = null
    this.removeAllListeners()
  }
}
