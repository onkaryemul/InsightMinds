"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"

interface Goal {
  id: number
  goal: string
  target: number
  target_duration: 'daily' | 'weekly'
}

interface CopingMechanism {
  id: number
  mechanism: string
}

export default function ClientGoalsAndCoping({ clientId }: { clientId: string }) {
  const supabase = createClient()
  const [goals, setGoals] = useState<Goal[]>([])
  const [mechanisms, setMechanisms] = useState<CopingMechanism[]>([])

  useEffect(() => {
    async function fetchClientData() {
      const [goalsRes, mechRes] = await Promise.all([
        supabase.from('goals').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('coping_mechanisms').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
      ])

      if (!goalsRes.error) setGoals(goalsRes.data || [])
      if (!mechRes.error) setMechanisms(mechRes.data || [])
    }

    fetchClientData()
  }, [clientId])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Treatment Goals</CardTitle>
          <CardDescription>These goals were assigned by your therapist</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {goals.length === 0 ? (
            <p className="text-muted-foreground">No active goals assigned.</p>
          ) : (
            goals.map(goal => (
              <div key={goal.id} className="p-3 border rounded-md">
                <p className="font-medium">{goal.goal}</p>
                <p className="text-sm text-muted-foreground">
                  {goal.target} times per {goal.target_duration}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Coping Mechanisms</CardTitle>
          <CardDescription>Assigned strategies to help you cope</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {mechanisms.length === 0 ? (
            <p className="text-muted-foreground">No active coping mechanisms.</p>
          ) : (
            mechanisms.map(mech => (
              <div key={mech.id} className="p-3 border rounded-md">
                <p className="font-medium">{mech.mechanism}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

