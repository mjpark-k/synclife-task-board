import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Task, Status } from '../types'
import { Card } from './Card'

type TaskPatch = {
  title: string
  description?: string
  status: Status
  priority: Task['priority']
  version: number
}

interface Props {
  title: string
  status: Status
  tasks: Task[]
  onMove: (id: string, status: Status) => void
  onDelete: (id: string) => void
  onEdit: (id: string, patch: TaskPatch) => void
  isFiltered: boolean
}

export function Column({ title, status, tasks, onMove, onDelete, onEdit, isFiltered }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 8,
  })
  
  return (
    <section
      className="column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const id = e.dataTransfer.getData('text/plain')
        if (id) onMove(id, status)
      }}
    >
      <h2 className="column-title">
        {title} <span className="count">{tasks.length}</span>
      </h2>
      <div ref={scrollRef} className="column-body">
        {tasks.length === 0 ? (
          <p className="column-empty">{isFiltered ? '조건에 맞는 태스크가 없습니다.' : '태스크가 없습니다.'}</p>
        ) : (
          <div
            className="virtual-list"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const task = tasks[virtualItem.index]

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  className="virtual-row"
                  style={{ transform: `translateY(${virtualItem.start}px)` }}
                >
                  <Card task={task} onDelete={onDelete} onEdit={onEdit} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
