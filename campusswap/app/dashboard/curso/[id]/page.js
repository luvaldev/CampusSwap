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

  const [mounted, setMounted] = useState(false)
  const [curso, setCurso] = useState(null)
  const [documents, setDocuments] = useState({ approved: [], quarantine: [] })
  const [stats, setStats] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [loadingChat, setLoadingChat] = useState(true)

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

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

  const fetchChatMessages = async (courseId) => {
    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(courseId)}`)
      if (res.ok) {
        const data = await res.json()
        setChatMessages(data.messages || [])
      }
    } catch (err) {
      console.error("Error fetching chat:", err)
    } finally {
      setLoadingChat(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    setSendingMessage(true)
    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(params.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      })
      if (res.ok) {
        const data = await res.json()
        setChatMessages(prev => [...prev, data.message])
        setNewMessage("")
      }
    } catch (err) {
      console.error("Error sending message:", err)
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 'calc(-1 * var(--space-10)) calc(-1 * var(--space-12))' }}>
      {/* Course Header */}
      <div style={{ padding: 'var(--space-8) var(--space-10) var(--space-5)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-0)' }}>
        <button onClick={() => router.push('/dashboard')} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={16} /> Volver al Dashboard
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
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
          <div className="curso-chat">
            <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <ChatCircle size={20} weight="fill" color="var(--brand)" />
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Foro del Curso</h2>
              </div>
              {stats && <span className="badge badge-neutral">{stats.totalMessages} mensajes</span>}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                        <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-brand)' }}>
                          {msg.user?.image ? (
                            <img src={msg.user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--brand-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                              {msg.user?.name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px' }}>
                          {isMe ? 'Tú' : msg.user?.name || 'Anónimo'} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className={isMe ? 'chat-bubble chat-bubble-me' : 'chat-bubble chat-bubble-other'}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-0)' }}>
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

      <style>{`
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
          .curso-split { flex-direction: column; }
          .curso-files { border-right: none; border-bottom: 1px solid var(--border-subtle); }
          .curso-chat { min-height: 300px; }
        }
      `}</style>
    </div>
  )
}