import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Task, Status } from '../types'
import { Card } from './Card'

interface Props {
  title: string
  status: Status
  tasks: Task[]
  onMove: (id: string, status: Status) => void
}

export function Column({ title, status, tasks, onMove }: Props) {
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
        <div
          className="virtual-list"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const task = tasks[virtualItem.index]

            return (
              <div
                key={task.id}
                className="virtual-row"
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
                <Card task={task} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
