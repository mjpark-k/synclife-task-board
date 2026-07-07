import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Task, Status, Priority } from './types'
import { createTask, deleteTask, getTasks, updateTask } from './api/client'
import { Column } from './components/Column'

const COLUMNS: { status: Status; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
]

type TaskPatch = {
  title: string
  description?: string
  status: Status
  priority: Priority
  version: number
}

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newStatus, setNewStatus] = useState<Status>('todo')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDescription, setNewDescription] = useState('')

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

  // 생성 성공 후 폼 초기화 함수
  const resetCreateForm = () => {
    setNewTitle('')
    setNewStatus('todo')
    setNewPriority('medium')
    setNewDescription('')
    setIsCreateOpen(false)
  }

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = newTitle.trim()
    const description = newDescription.trim()

    if (!title) {
      setMessage('제목을 입력해 주세요.')
      window.setTimeout(() => setMessage(null), 3000)
      return
    }

    const now = new Date().toISOString()
    const tempId = `temp-${crypto.randomUUID()}`

    const tempTask: Task = {
      id: tempId,
      title,
      description: description || undefined,
      status: newStatus,
      priority: newPriority,
      createdAt: now,
      updatedAt: now,
      version: 0,
    }

    setTasks((prev) => [tempTask, ...prev])
    resetCreateForm()

    createTask({
      title,
      description: description || undefined,
      status: newStatus,
      priority: newPriority,
    })
      .then((createdTask) => {
        setTasks((prev) => prev.map((task) => (task.id === tempId ? createdTask :  task)),
        )
      })
      .catch(() => {
        setTasks((prev) => prev.filter((task) => task.id !== tempId))
        setMessage('태스크 생성에 실패했습니다.')
        window.setTimeout(() => setMessage(null), 3000)
      })

  }

  const removeTask = (id: string) => {
    const ok = window.confirm('이 태스크를 삭제할까요?')
    if (!ok) return

    const previousTasks = tasks

    setTasks((prev) => prev.filter((task) => task.id !== id))

    deleteTask(id)
      .catch(() => {
        setTasks(previousTasks)
        setMessage('삭제에 실패해 변경을 되돌렸습니다.')
        window.setTimeout(() => setMessage(null), 3000)
      })
  }

// 카드 이동은 낙관적으로 먼저 반영하고, 서버 실패 시 롤백합니다.
// task별 최신 요청 번호를 비교해 오래된 응답이 최신 상태를 덮지 않도록 합니다.
  const editTask = (id: string, patch: TaskPatch) => {
    const previousTasks = tasks

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              ...patch,
            }
          : task,
      ),
    )

    updateTask(id, patch)
      .then((updatedTask) => {
        setTasks((prev) =>
          prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        )
      })
      .catch(() => {
        setTasks(previousTasks)
        setMessage('수정에 실패해 변경을 되돌렸습니다.')
        window.setTimeout(() => setMessage(null), 3000)
      })
  }

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

  return (
    <>
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}

      {tasks.length === 0 && (
        <p className="hint">등록된 태스크가 없습니다. 새 태스크를 생성해 주세요.</p>
      )}

      <div className="board-actions">
        <button type="button" onClick={() => setIsCreateOpen((prev) => !prev)}>
          + Task 생성
        </button>
      </div>

      {isCreateOpen && (
        <form className="create-form" onSubmit={addTask}>
          <label>
            제목
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="태스크 제목"
            />
          </label>

          <label>
            상태
            <select
              value={newStatus}
              onChange={(event) => setNewStatus(event.target.value as Status)}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label>
            우선순위
            <select
              value={newPriority}
              onChange={(event) => setNewPriority(event.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label>
            설명
            <textarea
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="선택 입력"
            />
          </label>

          <div className="form-actions">
            <button type="button" onClick={resetCreateForm}>
              취소
            </button>
            <button type="submit">추가</button>
          </div>
        </form>
      )}

      <div className="board">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={byStatus[col.status]}
            onMove={moveTask}
            onDelete={removeTask}
            onEdit={editTask}
          />
        ))}
      </div>
    </>
  )
}
