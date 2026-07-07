import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Task, Status } from './types'
import { getTasks, updateTask } from './api/client'
import { Column } from './components/Column'

const COLUMNS: { status: Status; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
]

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const latestMoveRequestRef = useRef<Record<string, number>>({})

  const loadTasks = useCallback(() => {
    setLoading(true)
    setError(null)

    getTasks()
      .then((data) => {
        setTasks(data)
      })
      .catch(() => {
        setError('태스크를 불러오지 못했습니다.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    // TODO(P1): 초기 로드 상태 처리
    loadTasks()
  }, [loadTasks])

// 카드 이동은 낙관적으로 먼저 반영하고, 서버 실패 시 롤백합니다.
// task별 최신 요청 번호를 비교해 오래된 응답이 최신 상태를 덮지 않도록 합니다.
  const moveTask = (id: string, status: Status) => {
    const task = tasks.find((t) => t.id === id)
    if (!task || task.status === status) return

    const previousTasks = tasks

    const requestId = (latestMoveRequestRef.current[id] ?? 0) + 1
    latestMoveRequestRef.current[id] = requestId

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))

    updateTask(id, { status, version: task.version })
      .then((updatedTask) => {
        if (latestMoveRequestRef.current[id] !== requestId) return

        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
        )
      })
      .catch(() => {
        if (latestMoveRequestRef.current[id] !== requestId) return

        setTasks(previousTasks)
        setMessage('저장에 실패해 변경을 되돌렸습니다.')
        window.setTimeout(() => setMessage(null), 3000)
      })
  }

  const byStatus = useMemo(() => {
    const map: Record<Status, Task[]> = { todo: [], 'in-progress': [], done: [] }
    for (const t of tasks) map[t.status].push(t)
    return map
  }, [tasks])

  if (loading) return <p className="hint">불러오는 중…</p>

  // error가 있으면 에러 UI + 재시도 버튼 추가
  if (error) {
    return (
      <div>
        <p className="hint">{error}</p>
        <button onClick={loadTasks}>다시 불러오기</button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return <p className="hint">등록된 태스크가 없습니다.</p>
  }

  return (
    <>
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
      <div className="board">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={byStatus[col.status]}
            onMove={moveTask}
          />
        ))}
      </div>
    </>
  )
}
