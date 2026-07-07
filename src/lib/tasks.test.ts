import { describe, it, expect } from 'vitest'
import {
  addTaskToTop,
  filterByTitle,
  moveTask,
  removeTaskById,
  replaceTask,
} from './tasks'
import type { Task } from '../types'

const make = (id: string, over: Partial<Task> = {}): Task => ({
  id,
  title: `Task ${id}`,
  status: 'todo',
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
  ...over,
})

describe('moveTask', () => {
  it('대상 태스크의 status 만 바꾸고 나머지는 그대로 둔다', () => {
    const tasks = [make('a'), make('b')]
    const next = moveTask(tasks, 'a', 'done')
    expect(next.find((t) => t.id === 'a')?.status).toBe('done')
    expect(next.find((t) => t.id === 'b')?.status).toBe('todo')
  })

  it('불변성을 지킨다 (원본 배열/객체를 변경하지 않는다)', () => {
    const tasks = [make('a')]
    const next = moveTask(tasks, 'a', 'done')
    expect(tasks[0].status).toBe('todo')
    expect(next).not.toBe(tasks)
  })
})

describe('filterByTitle', () => {
  it('대소문자 구분 없이 제목으로 필터링한다', () => {
    const tasks = [make('a', { title: 'Fix login bug' }), make('b', { title: 'Write docs' })]
    expect(filterByTitle(tasks, 'FIX')).toHaveLength(1)
  })

  it('빈 검색어면 전체를 반환한다', () => {
    const tasks = [make('a'), make('b')]
    expect(filterByTitle(tasks, '   ')).toHaveLength(2)
  })
})

describe('addTaskToTop', () => {
  it('새 태스크를 목록 맨 앞에 추가한다', () => {
    const tasks = [make('a'), make('b')]
    const newTask = make('new')

    const next = addTaskToTop(tasks, newTask)

    expect(next.map((task) => task.id)).toEqual(['new', 'a', 'b'])
  })

  it('원본 배열을 변경하지 않는다', () => {
    const tasks = [make('a')]
    const next = addTaskToTop(tasks, make('new'))

    expect(tasks.map((task) => task.id)).toEqual(['a'])
    expect(next).not.toBe(tasks)
  })
})

describe('replaceTask', () => {
  it('같은 id의 태스크만 서버 응답으로 교체한다', () => {
    const tasks = [make('a'), make('b')]
    const updated = make('a', { title: 'Updated', status: 'done', version: 2 })

    const next = replaceTask(tasks, updated)

    expect(next.find((task) => task.id === 'a')).toEqual(updated)
    expect(next.find((task) => task.id === 'b')).toEqual(tasks[1])
  })

  it('원본 배열과 원본 객체를 변경하지 않는다', () => {
    const tasks = [make('a')]
    const updated = make('a', { title: 'Updated' })

    const next = replaceTask(tasks, updated)

    expect(tasks[0].title).toBe('Task a')
    expect(next).not.toBe(tasks)
  })
})

describe('removeTaskById', () => {
  it('대상 id의 태스크만 제거한다', () => {
    const tasks = [make('a'), make('b'), make('c')]

    const next = removeTaskById(tasks, 'b')

    expect(next.map((task) => task.id)).toEqual(['a', 'c'])
  })

  it('원본 배열을 변경하지 않는다', () => {
    const tasks = [make('a'), make('b')]

    const next = removeTaskById(tasks, 'a')

    expect(tasks.map((task) => task.id)).toEqual(['a', 'b'])
    expect(next).not.toBe(tasks)
  })
})
