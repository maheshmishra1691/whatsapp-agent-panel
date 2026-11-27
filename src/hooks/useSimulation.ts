import { useCallback, useEffect, useRef } from 'react'
import { INCOMING_LEAD_SCRIPTS, pickAiResponse } from '../lib/aiResponses'
import { detectTriggers, pickPrimaryTrigger } from '../lib/triggers'
import type { Message, PanelAction, PanelState } from '../types'

const AI_DELAY_MS = 1200
const FAIL_EVERY = 15

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function useSimulation(
  state: PanelState,
  dispatch: React.Dispatch<PanelAction>,
) {
  const stateRef = useRef(state)
  const replyIndex = useRef(0)
  const incomingIndex = useRef(0)
  const humanSendCount = useRef(0)
  const timers = useRef<number[]>([])
  const generation = useRef(0)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const id = window.setInterval(() => {
      dispatch({ type: 'TICK_SLA', now: Date.now() })
    }, 1000)
    return () => {
      window.clearInterval(id)
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
  }, [dispatch])

  const resetSimulation = useCallback(() => {
    generation.current += 1
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    replyIndex.current = 0
    incomingIndex.current = 0
    humanSendCount.current = 0
  }, [])

  const simulateIncoming = useCallback(() => {
    const current = stateRef.current
    if (!current.agentOnline || current.isOffline) return

    const aiActive = current.conversations.filter((c) => c.state === 'AI_ACTIVE')
    if (aiActive.length === 0) return

    const target = aiActive[incomingIndex.current % aiActive.length]
    incomingIndex.current += 1

    const text =
      INCOMING_LEAD_SCRIPTS[incomingIndex.current % INCOMING_LEAD_SCRIPTS.length]
    const leadMessage: Message = {
      id: uid('lead'),
      conversationId: target.id,
      sender: 'lead',
      text,
      timestamp: Date.now(),
      status: 'delivered',
    }

    dispatch({
      type: 'ADD_LEAD_MESSAGE',
      conversationId: target.id,
      message: leadMessage,
    })

    dispatch({ type: 'START_TYPING', conversationId: target.id })

    const gen = generation.current
    const timer = window.setTimeout(() => {
      if (generation.current !== gen) return

      const latest =
        stateRef.current.conversations.find((c) => c.id === target.id) ?? target
      if (latest.state !== 'AI_ACTIVE') {
        dispatch({ type: 'CLEAR_TYPING' })
        return
      }

      const snapshot = {
        ...latest,
        messages: [...latest.messages],
      }
      if (!snapshot.messages.some((m) => m.id === leadMessage.id)) {
        snapshot.messages = [...snapshot.messages, leadMessage]
        snapshot.unansweredAiTurns = latest.unansweredAiTurns + 1
      }

      const triggers = detectTriggers(text, snapshot)
      const primary = pickPrimaryTrigger(triggers)
      const idx = replyIndex.current++
      const replyText = pickAiResponse(target.brandInterest, idx, Boolean(primary))

      const aiMessage: Message = {
        id: uid('ai'),
        conversationId: target.id,
        sender: 'ai',
        text: replyText,
        timestamp: Date.now(),
        status: 'delivered',
      }

      dispatch({
        type: 'AI_REPLY',
        conversationId: target.id,
        message: aiMessage,
        trigger: primary ?? undefined,
      })
    }, AI_DELAY_MS)
    timers.current.push(timer)
  }, [dispatch])

  const sendHumanMessage = useCallback(
    (conversationId: string, text: string) => {
      if (!text.trim()) return
      if (stateRef.current.isOffline) return

      humanSendCount.current += 1
      const failed = humanSendCount.current % FAIL_EVERY === 0
      const message: Message = {
        id: uid('human'),
        conversationId,
        sender: 'human',
        text: text.trim(),
        timestamp: Date.now(),
        status: failed ? 'failed' : 'sent',
      }
      dispatch({ type: 'HUMAN_SEND', conversationId, message })
      if (!failed) {
        const gen = generation.current
        const t1 = window.setTimeout(() => {
          if (generation.current !== gen) return
          dispatch({
            type: 'MARK_MESSAGE_STATUS',
            conversationId,
            messageId: message.id,
            status: 'delivered',
          })
        }, 400)
        const t2 = window.setTimeout(() => {
          if (generation.current !== gen) return
          dispatch({
            type: 'MARK_MESSAGE_STATUS',
            conversationId,
            messageId: message.id,
            status: 'read',
          })
        }, 900)
        timers.current.push(t1, t2)
      }
    },
    [dispatch],
  )

  return { simulateIncoming, sendHumanMessage, resetSimulation }
}
