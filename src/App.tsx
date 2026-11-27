import { useEffect, useMemo, useReducer, useState } from 'react'
import { ChatThread } from './components/ChatThread'
import { ConversationList } from './components/ConversationList'
import { Header } from './components/Header'
import { KpiStrip } from './components/KpiStrip'
import { LeadPanel } from './components/LeadPanel'
import { cloneInitialState } from './data/seed'
import { useSimulation } from './hooks/useSimulation'
import { hitlReducer } from './lib/hitlReducer'
import { computeKpis } from './lib/metrics'
import type { FilterTab } from './types'

type MobilePane = 'list' | 'chat' | 'lead'

export default function App() {
  const [state, dispatch] = useReducer(hitlReducer, undefined, cloneInitialState)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [query, setQuery] = useState('')
  const [now, setNow] = useState(Date.now())
  const [mobilePane, setMobilePane] = useState<MobilePane>('list')

  const { simulateIncoming, sendHumanMessage, resetSimulation } = useSimulation(
    state,
    dispatch,
  )

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobilePane('list')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selected = useMemo(
    () => state.conversations.find((c) => c.id === state.selectedId) ?? null,
    [state.conversations, state.selectedId],
  )

  const kpis = useMemo(() => computeKpis(state, now), [state, now])

  const selectConversation = (id: string) => {
    dispatch({ type: 'SELECT', id })
    setMobilePane('chat')
  }

  return (
    <div className="flex h-full flex-col bg-bg text-white">
      <Header
        agentOnline={state.agentOnline}
        isOffline={state.isOffline}
        actionLog={state.actionLog}
        onToggleAgent={() => dispatch({ type: 'TOGGLE_AGENT' })}
        onToggleOffline={() => dispatch({ type: 'TOGGLE_OFFLINE' })}
        onSimulate={simulateIncoming}
        onReset={() => {
          resetSimulation()
          dispatch({ type: 'RESET', payload: cloneInitialState() })
          setFilter('all')
          setQuery('')
          setMobilePane('list')
        }}
      />

      {state.isOffline && (
        <div
          className="shrink-0 border-b border-alert/30 bg-alert/10 px-4 py-2 text-center text-xs text-alert"
          role="alert"
        >
          You are offline. Simulation and sends are paused until connectivity returns.
        </div>
      )}

      {!state.agentOnline && (
        <div
          className="shrink-0 border-b border-white/10 bg-white/5 px-4 py-2 text-center text-xs text-white/60"
          role="status"
        >
          Agent is offline. Incoming lead simulation is disabled.
        </div>
      )}

      <KpiStrip kpis={kpis} />

      {/* Desktop / tablet 3-pane */}
      <div className="hidden min-h-0 flex-1 lg:flex">
        <ConversationList
          conversations={state.conversations}
          selectedId={state.selectedId}
          filter={filter}
          query={query}
          onFilterChange={setFilter}
          onQueryChange={setQuery}
          onSelect={selectConversation}
          now={now}
        />
        <ChatThread
          conversation={selected}
          typing={state.typingConversationId === selected?.id}
          now={now}
          onTakeOver={() =>
            selected && dispatch({ type: 'TAKE_OVER', conversationId: selected.id })
          }
          onHandback={() =>
            selected && dispatch({ type: 'HANDBACK', conversationId: selected.id })
          }
          onResolve={() =>
            selected && dispatch({ type: 'RESOLVE', conversationId: selected.id })
          }
          onReassign={() =>
            selected && dispatch({ type: 'REASSIGN', conversationId: selected.id })
          }
          onSend={(text) => selected && sendHumanMessage(selected.id, text)}
          onRetry={(messageId) =>
            selected &&
            dispatch({
              type: 'RETRY_MESSAGE',
              conversationId: selected.id,
              messageId,
            })
          }
        />
        <LeadPanel conversation={selected} />
      </div>

      {/* Mobile: list | chat as separate screens */}
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        {mobilePane === 'list' && (
          <ConversationList
            conversations={state.conversations}
            selectedId={state.selectedId}
            filter={filter}
            query={query}
            onFilterChange={setFilter}
            onQueryChange={setQuery}
            onSelect={selectConversation}
            now={now}
          />
        )}
        {mobilePane === 'chat' && (
          <ChatThread
            conversation={selected}
            typing={state.typingConversationId === selected?.id}
            now={now}
            onBack={() => setMobilePane('list')}
            onTakeOver={() =>
              selected && dispatch({ type: 'TAKE_OVER', conversationId: selected.id })
            }
            onHandback={() =>
              selected && dispatch({ type: 'HANDBACK', conversationId: selected.id })
            }
            onResolve={() =>
              selected && dispatch({ type: 'RESOLVE', conversationId: selected.id })
            }
            onReassign={() =>
              selected && dispatch({ type: 'REASSIGN', conversationId: selected.id })
            }
            onSend={(text) => selected && sendHumanMessage(selected.id, text)}
            onRetry={(messageId) =>
              selected &&
              dispatch({
                type: 'RETRY_MESSAGE',
                conversationId: selected.id,
                messageId,
              })
            }
          />
        )}
        {mobilePane === 'lead' && (
          <LeadPanel conversation={selected} onClose={() => setMobilePane('chat')} />
        )}
        {mobilePane === 'chat' && selected && (
          <button
            type="button"
            onClick={() => setMobilePane('lead')}
            className="shrink-0 border-t border-border bg-card px-4 py-2 text-center text-xs text-accent"
          >
            View lead context
          </button>
        )}
      </div>
    </div>
  )
}
