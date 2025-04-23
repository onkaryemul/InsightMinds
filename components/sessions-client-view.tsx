"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, StickyNote, NotebookPen, ArrowLeftRight } from "lucide-react"

interface Session {
    id: string
    title: string | null
    session_date: string
    note_type: string
    client_summary: string | null
    clinician_summary: string | null
    notes: string | null
}

export default function SessionsClientView({ clientId }: { clientId: string }) {
    const supabase = createClient()
    const [sessions, setSessions] = useState<Session[]>([])
    const [selectedSession, setSelectedSession] = useState<Session | null>(null)

    useEffect(() => {
        const fetchSessions = async () => {
            const { data, error } = await supabase
                .from("sessions")
                .select("id, title, session_date, note_type, client_summary, clinician_summary, notes")
                .eq("client_id", clientId)
                .eq("status", "completed")
                .order("session_date", { ascending: false })

            if (!error && data) {
                setSessions(data)
            }
        }

        fetchSessions()
    }, [clientId])



    const formatText = (text: string) => {
        return text
            // Ensure space after numbered points like "1.", "2.", etc.
            .replace(/(\d+\.)\s*/g, '\n$1 ')
            // Ensure space after bullet points like "-", "*"
            .replace(/([*-])\s*/g, '\n$1 ')
            // Replace multiple newlines with max 2 lines
            .replace(/\n{3,}/g, '\n\n')
            // Convert straight double quotes to curly quotes (optional)
            .replace(/"([^"]*)"/g, '“$1”')
            .trim()
    }


    return (
        <div className="p-6 space-y-6">
            <h2 className="text-3xl font-bold">Completed Therapy Sessions</h2>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Session List */}
                <div className="space-y-4">
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <Card
                                key={session.id}
                                className={`p-4 transition-all rounded-xl border-2 shadow-sm cursor-pointer ${selectedSession?.id === session.id ? "border-blue-600 ring-2 ring-blue-200" : "border-muted"
                                    }`}
                                onClick={() => setSelectedSession(session)}
                            >
                                <div className="flex flex-col">
                                    <span className="text-lg font-semibold">
                                        {session.title || `Session on ${new Date(session.session_date).toLocaleDateString()}`}
                                    </span>
                                    <span className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                        <StickyNote className="w-4 h-4" />
                                        {session.note_type}
                                        <Calendar className="w-4 h-4 ml-4" />
                                        {new Date(session.session_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm">No completed sessions found.</p>
                    )}
                </div>

                {/* Session Details */}
                {selectedSession && (
                    <Card className="p-6 rounded-xl shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-semibold">{selectedSession.title || "Session Details"}</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSession(null)}
                                className="flex items-center gap-1 text-sm text-blue-600"
                            >
                                <ArrowLeftRight className="w-4 h-4" />
                                Back to List
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Date:</strong> {new Date(selectedSession.session_date).toLocaleDateString()}</p>
                            <p><strong>Note Type:</strong> {selectedSession.note_type}</p>
                        </div>

                        {selectedSession.client_summary && (
                            <div className="pt-4">
                                <h4 className="text-lg font-medium flex items-center gap-2">
                                    <NotebookPen className="w-5 h-5 text-blue-500" />
                                    Client Summary
                                </h4>

                                <p className="text-sm whitespace-pre-wrap text-muted-foreground mt-1">
                                    {formatText(selectedSession.client_summary)}
                                </p>
                            </div>
                        )}

                        {selectedSession.clinician_summary && (
                            <div className="pt-4">
                                <h4 className="text-lg font-medium flex items-center gap-2">
                                    <NotebookPen className="w-5 h-5 text-green-500" />
                                    Clinician Summary
                                </h4>

                                <p className="text-sm whitespace-pre-wrap text-muted-foreground mt-1">
                                    {formatText(selectedSession.clinician_summary)}
                                </p>
                            </div>
                        )}

                        {selectedSession.notes && (() => {
                            try {
                                const notesObject = JSON.parse(selectedSession.notes ?? '{}')

                                return (
                                    <div className="space-y-4 text-sm text-muted-foreground">
                                        <h4 className="text-lg font-medium flex items-center gap-2">
                                            <StickyNote className="w-5 h-5 text-yellow-500" />
                                            Full Notes
                                        </h4>

                                        {Object.entries(notesObject).map(([key, value]) => (
                                            <div key={key}>
                                                <h5 className="font-semibold capitalize">{key}</h5>
                                                <p className="whitespace-pre-wrap">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )
                            } catch (err) {
                                return (
                                    <p className="text-sm whitespace-pre-wrap text-muted-foreground mt-1">
                                        {formatText(selectedSession.notes ?? '')}
                                    </p>
                                )
                            }
                        })()}
                    </Card>
                )}
            </div>
        </div>
    )
}
