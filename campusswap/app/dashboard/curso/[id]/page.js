'use client'
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import {
  FileText, ChatCircle, PaperPlaneTilt, DownloadSimple,
  CheckCircle, WarningCircle, Clock, Users, UploadSimple, ArrowLeft
} from "@phosphor-icons/react"

import { cursosDB } from "../../../data/database"

export default function CursoDetalle() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const chatEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const [mounted, setMounted] = useState(false)
  const [curso, setCurso] = useState(null)
  const [documents, setDocuments] = useState({ approved: [], quarantine: [] })
  const [stats, setStats] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [loadingChat, setLoadingChat] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [hasLoadedChat, setHasLoadedChat] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [hasUnreadChat, setHasUnreadChat] = useState(false)

  const showMobileChatRef = useRef(showMobileChat)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    showMobileChatRef.current = showMobileChat
  }, [showMobileChat])

  const toggleMobileChat = () => {
    setShowMobileChat(prev => {
      const next = !prev
      if (next) {
        setHasUnreadChat(false)
      }
      return next
    })
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    if (status === "authenticated" && params?.id) {
      const decodedId = decodeURIComponent(params.id)
      // Try to get course info from local DB first for fast render
      const foundCurso = cursosDB.find(c => c.id === decodedId || c.nombre === decodedId)
      if (foundCurso) {
        setCurso({ id: foundCurso.id, name: foundCurso.nombre, credits: foundCurso.creditos })
      } else {
        setCurso({ id: decodedId, name: decodedId, credits: 0 })
      }

      // Fetch real data from APIs
      fetchCourseData(decodedId)
      if (session?.user?.role !== 'GUEST') {
        fetchChatMessages(decodedId)
      } else {
        setLoadingChat(false)
      }
    }
  }, [status, router, params])

  // Polling para Chat en Vivo (cada 3 segundos, silencioso)
  useEffect(() => {
    if (status !== "authenticated" || !params?.id || session?.user?.role === 'GUEST') return
    const decodedId = decodeURIComponent(params.id)
    const interval = setInterval(() => {
      fetchChatMessages(decodedId, true)
    }, 3000)
    return () => clearInterval(interval)
  }, [status, params, session])

  const scrollToBottom = (behavior = "smooth") => {
    chatEndRef.current?.scrollIntoView({ behavior })
  }

  const isNearBottom = () => {
    const container = chatContainerRef.current
    if (!container) return false
    const threshold = 150
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
  }

  useEffect(() => {
    if (chatMessages.length > 0) {
      if (!hasLoadedChat) {
        scrollToBottom("auto")
        setHasLoadedChat(true)
      } else if (isNearBottom()) {
        scrollToBottom("smooth")
      }
    }
  }, [chatMessages, hasLoadedChat])

  const fetchCourseData = async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(courseId)}`)
      if (res.ok) {
        const data = await res.json()
        setCurso(data.course)
        setDocuments(data.documents)
        setStats(data.stats)
      }
    } catch (err) {
      console.error("Error fetching course:", err)
    } finally {
      setLoadingDocs(false)
    }
  }

  const playNotificationSound = () => {
    if (window.innerWidth > 900) return
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      
      // Tone 1
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5 note
      gain1.gain.setValueAtTime(0.08, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 0.15)
      
      // Tone 2
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08) // A5 note
      gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.08)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.08)
      osc2.stop(ctx.currentTime + 0.25)
    } catch (err) {
      console.warn("Could not play notification sound:", err)
    }
  }

  const fetchChatMessages = async (courseId, silent = false) => {
    if (!silent) setLoadingChat(true)
    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const newMessages = data.messages || []
        
        setChatMessages(prevMessages => {
          if (!isMountedRef.current) return prevMessages
          // Detect new unread messages when mobile chat is closed
          if (silent && !showMobileChatRef.current && prevMessages.length > 0 && newMessages.length > prevMessages.length) {
            const lastMsg = newMessages[newMessages.length - 1]
            if (lastMsg && lastMsg.user?.name !== session?.user?.name) {
              setHasUnreadChat(true)
              playNotificationSound()
            }
          }
          return newMessages
        })
      }
    } catch (err) {
      console.error("Error fetching chat:", err)
    } finally {
      if (!silent) setLoadingChat(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    const messageText = newMessage.trim()
    
    // Optimistic UI update
    setNewMessage("")
    setSendingMessage(true)
    
    const tempId = `temp-${Date.now()}`
    const optimisticMsg = {
      id: tempId,
      content: messageText,
      createdAt: new Date().toISOString(),
      user: { name: session?.user?.name, image: session?.user?.image },
      isOptimistic: true
    }
    
    setChatMessages(prev => [...prev, optimisticMsg])
    setTimeout(() => scrollToBottom("smooth"), 50)

    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(params.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText }),
      })
      if (res.ok) {
        const data = await res.json()
        setChatMessages(prev => prev.map(msg => msg.id === tempId ? data.message : msg))
      } else {
        setChatMessages(prev => prev.filter(msg => msg.id !== tempId))
      }
    } catch (err) {
      console.error("Error sending message:", err)
      setChatMessages(prev => prev.filter(msg => msg.id !== tempId))
    } finally {
      setSendingMessage(false)
    }
  }

  if (status === "loading" || !mounted || !curso) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  const allDocs = [...documents.approved, ...documents.quarantine]

  return (
    <div className="curso-container">
      {/* Course Header */}
      <div className="curso-header">
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="curso-header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span className="badge badge-brand mono">{(curso.id || '').toUpperCase()}</span>
              {session?.user?.role !== 'GUEST' && (
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> {stats?.enrolledUsers || 0} Alumnos inscritos
                </span>
              )}
            </div>
            <h1 className="page-title">{curso.name}</h1>
          </div>
          {session?.user?.role !== 'GUEST' && (
            <button onClick={() => router.push('/dashboard/subir')} className="btn btn-primary">
              <UploadSimple size={18} /> Subir Apunte
            </button>
          )}
        </div>
      </div>

      {/* Split layout */}
      <div className="curso-split">
        {/* Archivos (Apuntes) */}
        <div className="curso-files" style={{ borderRight: session?.user?.role === 'GUEST' ? 'none' : undefined }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileText size={20} weight="fill" color="var(--brand)" /> Repositorio de Apuntes
          </h2>

          {loadingDocs ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64 }} />)}
            </div>
          ) : allDocs.length === 0 ? (
            <div className="empty-state">
              <FileText size={36} color="var(--text-muted)" style={{ marginBottom: 'var(--space-4)' }} />
              <p style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Sin apuntes aún</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Sé el primero en compartir material para este curso.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {allDocs.map(file => (
                <div key={file.id} className="file-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div className="icon-box icon-box-md" style={{ background: file.status === 'APPROVED' ? 'var(--success-subtle)' : 'var(--warning-subtle)' }}>
                      <FileText size={20} color={file.status === 'APPROVED' ? 'var(--success)' : 'var(--warning)'} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{file.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: '2px' }}>
                        {file.size} MB · {file.uploader?.name || 'Anónimo'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    {file.status === 'APPROVED' ? (
                      <span className="badge badge-success"><CheckCircle size={12} weight="fill" /> Verificado</span>
                    ) : (
                      <span className="badge badge-warning"><WarningCircle size={12} weight="fill" /> Cuarentena</span>
                    )}
                    {file.status === 'APPROVED' && (
                      <button className="btn btn-secondary btn-sm" title="Descargar">
                        <DownloadSimple size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat */}
        {session?.user?.role !== 'GUEST' && (
          <div className={`curso-chat ${showMobileChat ? 'show-mobile' : ''}`}>
            <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <button onClick={() => setShowMobileChat(false)} className="chat-close-btn" aria-label="Cerrar foro">
                  <ArrowLeft size={18} />
                </button>
                <ChatCircle size={20} weight="fill" color="var(--brand)" />
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Foro del Curso</h2>
              </div>
              {stats && <span className="badge badge-neutral">{stats.totalMessages} mensajes</span>}
            </div>

            <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {loadingChat ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, width: i % 2 === 0 ? '60%' : '70%' }} />)}
                </div>
              ) : chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                  <ChatCircle size={32} style={{ margin: '0 auto var(--space-3)' }} />
                  <p style={{ fontSize: 'var(--text-sm)' }}>Sé el primero en iniciar la conversación.</p>
                </div>
              ) : (
                chatMessages.map(msg => {
                  const isMe = msg.user?.name === session?.user?.name
                  return (
                    <div key={msg.id} style={{ display: 'flex', gap: 'var(--space-3)', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                      {!isMe && (
                        <div onClick={() => setSelectedUser(msg.user)} style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-brand)', cursor: 'pointer' }}>
                          {msg.user?.image ? (
                            <img src={msg.user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--brand-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                              {(msg.user?.nickname || msg.user?.name)?.[0] || '?'}
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px', display: 'block' }}>
                          {isMe ? (
                            'Tú · '
                          ) : (
                            <>
                              <button onClick={() => setSelectedUser(msg.user)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', display: 'inline' }}>
                                {msg.user?.nickname || msg.user?.name || 'Anónimo'}
                              </button>
                              {' · '}
                            </>
                          )}
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className={isMe ? 'chat-bubble chat-bubble-me' : 'chat-bubble chat-bubble-other'} style={{ opacity: msg.isOptimistic ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="curso-chat-form" style={{ padding: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--surface-0)', border: '1px solid var(--border-default)', padding: '4px 4px 4px var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                <input
                  type="text"
                  placeholder="Escribe un mensaje al curso..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={sendingMessage}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-sans)' }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="btn btn-primary btn-sm"
                  style={{ width: 36, height: 36, padding: 0, borderRadius: 'var(--radius-sm)' }}
                >
                  {sendingMessage ? <div className="spinner spinner-sm" /> : <PaperPlaneTilt size={16} weight="fill" />}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Mini Info Modal */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)} style={{ zIndex: 10000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 320, padding: 'var(--space-6)', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto var(--space-4)', border: '3px solid var(--brand)' }}>
              {selectedUser.image ? (
                <img src={selectedUser.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--brand-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
                  {(selectedUser.nickname || selectedUser.name)?.[0] || '?'}
                </div>
              )}
            </div>
            
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>
              {selectedUser.nickname || selectedUser.name || 'Anónimo'}
            </h3>
            
            {selectedUser.nickname && selectedUser.name && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>
                {selectedUser.name}
              </p>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Karma</p>
                <p style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--karma)' }}>{selectedUser.karma || 0}</p>
              </div>
              <div style={{ width: 1, background: 'var(--border-subtle)', margin: '0 var(--space-3)' }} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Carrera</p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.2 }}>{selectedUser.career?.name || 'Sin especificar'}</p>
              </div>
            </div>

            <button onClick={() => setSelectedUser(null)} className="btn btn-secondary btn-full" style={{ marginTop: 'var(--space-5)' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* FAB for Chat on Mobile */}
      {session?.user?.role !== 'GUEST' && !showMobileChat && (
        <button 
          onClick={toggleMobileChat}
          className="chat-fab"
          aria-label="Foro del curso"
        >
          <ChatCircle size={24} weight="fill" color="var(--text-on-brand)" />
          {hasUnreadChat && <span className="chat-fab-badge" />}
        </button>
      )}

      <style>{`
        .curso-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 56px);
          margin: calc(-1 * var(--space-10)) calc(-1 * var(--space-12));
        }
        .curso-header {
          padding: var(--space-8) var(--space-10) var(--space-5);
          border-bottom: 1px solid var(--border-subtle);
          background: var(--surface-0);
        }
        .curso-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: var(--space-4);
        }
        .chat-fab {
          display: none;
        }
        .chat-close-btn {
          display: none;
        }
        .curso-split {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .curso-files {
          flex: 1.2;
          padding: var(--space-8) var(--space-10);
          overflow-y: auto;
          border-right: 1px solid var(--border-subtle);
        }
        .curso-chat {
          flex: 0.8;
          display: flex;
          flex-direction: column;
          background: var(--surface-1);
        }
        @media (max-width: 900px) {
          .chat-fab {
            display: flex;
            position: fixed;
            bottom: calc(80px + env(safe-area-inset-bottom));
            right: var(--space-4);
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--brand);
            border: none;
            box-shadow: var(--shadow-lg);
            cursor: pointer;
            z-index: 1000;
            align-items: center;
            justify-content: center;
            transition: transform var(--duration-fast) var(--ease-out);
          }
          .chat-fab:active {
            transform: scale(0.9);
          }
          .chat-fab-badge {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--brand); /* use brand color-mix or standard red */
            background: var(--danger);
            border: 2px solid var(--brand);
          }
          .chat-close-btn {
            display: flex;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0;
            align-items: center;
            justify-content: center;
            margin-right: var(--space-1);
          }
          .curso-container {
            height: calc(100dvh - 56px - 64px - env(safe-area-inset-bottom)) !important;
            margin: calc(-1 * var(--space-5)) calc(-1 * var(--space-4)) 0 !important;
          }
          .curso-header {
            padding: var(--space-4) var(--space-4) var(--space-3);
          }
          .curso-header-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: var(--space-2);
          }
          .curso-header-row button {
            width: 100%;
            margin-top: 0;
          }
          .curso-split {
            flex-direction: column;
            flex: 1;
            overflow: hidden;
          }
          .curso-files {
            flex: 1;
            border-right: none;
            border-bottom: none;
            padding: var(--space-4);
            overflow-y: auto;
          }
          .curso-chat {
            display: none;
          }
          .curso-chat.show-mobile {
            display: flex !important;
            position: fixed;
            top: 56px;
            left: 0;
            right: 0;
            bottom: calc(64px + env(safe-area-inset-bottom));
            width: 100vw;
            max-width: 100vw;
            height: auto;
            z-index: 999;
            background: var(--surface-1);
            animation: slideUp 0.25s ease-out;
          }
          .curso-chat-form {
            padding: var(--space-3) !important;
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  )
}