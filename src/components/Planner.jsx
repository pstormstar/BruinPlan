import React, { useState, useEffect, useRef } from 'react'
// Top-level component orchestrating the planner state and layout.
import Sidebar from './Sidebar'
import YearGrid from './YearGrid'
import AddCourseForm from './AddCourseForm'
import Login from './Login'
import { initialPlan } from '../plannerData'
import { supabase } from '../lib/supabaseClient'
import '../planner.css'

export default function Planner() {
  const [plan, setPlan] = useState(() => {
    try {
      const raw = localStorage.getItem('plan')
      return raw ? JSON.parse(raw) : initialPlan
    } catch {
      return initialPlan
    }
  })

  const [user, setUser] = useState(null)
  const serverPlanId = useRef(null)

  // save to localStorage always
  useEffect(() => {
    localStorage.setItem('plan', JSON.stringify(plan))
  }, [plan])

  // auth listener
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
    // check current user on mount
    supabase.auth.getUser().then(res => setUser(res.data.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  // load plans for user when they login
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data, error } = await supabase.from('plans').select('id,name,data').eq('user_id', user.id)
      if (error) {
        console.error('load plans error', error)
        return
      }
      if (data && data.length > 0) {
        // take first plan
        serverPlanId.current = data[0].id
        setPlan(data[0].data)
      } else {
        // no server plan; migrate local storage plan to server
        const local = localStorage.getItem('plan')
        if (local) {
          try {
            const payload = JSON.parse(local)
            const { data: insertData, error: insertErr } = await supabase.from('plans').insert({ user_id: user.id, name: 'My Plan', data: payload }).select().single()
            if (!insertErr) serverPlanId.current = insertData.id
          } catch (e) {
            console.error('migration error', e)
          }
        }
      }
    })()
  }, [user])

  // save plan to server when user is logged in, debounced
  useEffect(() => {
    if (!user) return
    const t = setTimeout(async () => {
      try {
        const upsert = { id: serverPlanId.current ?? undefined, user_id: user.id, name: 'My Plan', data: plan }
        const { data: saved, error } = await supabase.from('plans').upsert(upsert).select().single()
        if (error) console.error('save plan error', error)
        else serverPlanId.current = saved.id
      } catch (e) { console.error(e) }
    }, 1000)
    return () => clearTimeout(t)
  }, [plan, user])

  function addYear() {
    const newYear = {
      id: Date.now(),
      yearLabel: `Year ${plan.length + 1}`,
      quarters: [
        { id: 'q1', label: 'Fall', courses: [] },
        { id: 'q2', label: 'Winter', courses: [] },
        { id: 'q3', label: 'Spring', courses: [] },
        { id: 'q4', label: 'Summer', courses: [] }
      ]
    }
    setPlan(p => [...p, newYear])
  }

  function resetPlan() {
    localStorage.removeItem('plan')
    setPlan(initialPlan)
  }

  function addCourseToQuarter(yearId, quarterId, course) {
    setPlan(p => p.map(y => {
      if (y.id !== yearId) return y
      return { ...y, quarters: y.quarters.map(q => q.id === quarterId ? { ...q, courses: [...q.courses, course] } : q) }
    }))
  }

  function removeCourse(yearId, quarterId, courseId) {
    setPlan(p => p.map(y => {
      if (y.id !== yearId) return y
      return { ...y, quarters: y.quarters.map(q => q.id === quarterId ? { ...q, courses: q.courses.filter(c => c.id !== courseId) } : q) }
    }))
  }

  function editCourse(yearId, quarterId, course) {
    // simple prompt-based edit for template
    const code = prompt('Course code', course.code)
    const title = prompt('Course title', course.title)
    if (code == null || title == null) return
    setPlan(p => p.map(y => {
      if (y.id !== yearId) return y
      return {
        ...y,
        quarters: y.quarters.map(q => {
          if (q.id !== quarterId) return q
          return { ...q, courses: q.courses.map(c => c.id === course.id ? { ...c, code, title } : c) }
        })
      }
    }))
  }

  // handleAddCourse now receives a yearId and quarterId from the form
  function handleAddCourse(yearId, quarterId, course) {
    addCourseToQuarter(yearId, quarterId, course)
  }

  return (
    <div className="planner-app">
      <header className="planner-header">
        <h1>BruinPlan</h1>
      </header>
      <div className="planner-content">
        <Sidebar onAddYear={addYear} onReset={resetPlan} />
        <main className="planner-main">
          {/* if not logged in show login */}
          {!user ? (
            <div style={{padding:12}}>
              <Login onLogin={(u)=>setUser(u)} />
            </div>
          ) : (
            <>
              <div className="planner-controls">
                <AddCourseForm years={plan} onAdd={handleAddCourse} />
              </div>
              <YearGrid plan={plan} onRemoveCourse={removeCourse} onEditCourse={(yid,qid,course)=>editCourse(yid,qid,course)} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
