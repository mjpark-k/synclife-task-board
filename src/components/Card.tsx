import { type FormEvent, type MouseEvent, useState } from 'react'
import type { Priority, Status, Task } from '../types'

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

type TaskPatch = {
  title: string
  description?: string
  status: Status
  priority: Priority
  version: number
}

type CardProps = {
  task: Task
  onDelete: (id: string) => void
  onEdit: (id: string, patch: TaskPatch) => void
}

export function Card({ task, onDelete, onEdit }: CardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editStatus, setEditStatus] = useState<Status>(task.status)
  const [editPriority, setEditPriority] = useState<Priority>(task.priority)
  const [editDescription, setEditDescription] = useState(task.description ?? '')

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onDelete(task.id)
  }

  const startEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setEditTitle(task.title)
    setEditStatus(task.status)
    setEditPriority(task.priority)
    setEditDescription(task.description ?? '')
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditTitle(task.title)
    setEditStatus(task.status)
    setEditPriority(task.priority)
    setEditDescription(task.description ?? '')
  }

  const submitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = editTitle.trim()
    const description = editDescription.trim()

    if (!title) return

    onEdit(task.id, {
      title,
      description: description || undefined,
      status: editStatus,
      priority: editPriority,
      version: task.version,
    })

    setIsEditing(false)
  }

  return (
    <article
      className={`card priority-${task.priority}`}
      draggable={!isEditing}
      onDragStart={(event) => event.dataTransfer.setData('text/plain', task.id)}
    >
      {isEditing ? (
        <form 
          className="card-edit-form" 
          onSubmit={submitEdit} 
          onDragStart={(event) => event.preventDefault()}
        >
          <input
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            placeholder="태스크 제목"
          />

          <div className="card-edit-row">
            <select
              value={editStatus}
              onChange={(event) => setEditStatus(event.target.value as Status)}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={editPriority}
              onChange={(event) => setEditPriority(event.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <textarea
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            placeholder="설명"
          />

          <div className="card-edit-actions">
            <button type="button" onClick={cancelEdit}>
              취소
            </button>
            <button type="submit">저장</button>
          </div>
        </form>
      ) : (
        <>
          <div className="card-header">
            <div className="card-title" title={task.title}>
              {task.title}
            </div>
            <div className="card-actions">
              <button
                type="button"
                className="card-action"
                onClick={startEdit}
                onMouseDown={(event) => event.stopPropagation()}
                aria-label="태스크 수정"
              >
                수정
              </button>
              <button
                type="button"
                className="card-action danger"
                onClick={handleDelete}
                onMouseDown={(event) => event.stopPropagation()}
                aria-label="태스크 삭제"
              >
                X
              </button>
            </div>
          </div>

          <div className="card-meta">
            <span className={`badge badge-${task.priority}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
            <span className="date">{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </>
      )}
    </article>
  )
}
