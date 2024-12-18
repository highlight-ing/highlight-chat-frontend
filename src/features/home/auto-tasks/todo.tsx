'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Highlight, { type FocusedWindow, type HighlightContext } from '@highlight-ai/app-runtime'
import { CheckCircle2, ChevronDown, Circle, Plus, Search, Tag, Trash2, UserIcon, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'

import { useName } from './name-provider'
import {
  conversations_system_prompt,
  overall_conversations_system_prompt,
  tasks_system_prompt_llm,
  tasks_system_prompt_slm,
} from './prompts'

type StatusType = 'pending' | 'completed' | 'deleted' | 'false_positive'
type AdditionMethodType = 'manually' | 'automatically' | 'semi_automatically'

export interface Task {
  id: string
  text: string
  status: StatusType
  additionMethod: AdditionMethodType
  fadingOut: boolean
  lastModified: string
  priority: 'high' | 'medium' | 'low'
  sourceId: string
  tags: string[] // Changed from single category to multiple tags
  assignedBy?: string
}

interface TodoItemProps {
  todo: Task
  onCheckedChange: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, text: string) => void
  onAddTag: (todoId: string, tag: string) => void
  onRemoveTag: (todoId: string, tag: string) => void // Add this
  allTags: Set<string>
}

interface DetectedTask {
  id: string
  metadata: Record<string, any>
  text: string
}

interface DetectedTasksCardProps {
  tasks: DetectedTask[]
  onAccept: (task: DetectedTask) => void
  onDecline: (task: DetectedTask) => void
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onCheckedChange,
  onDelete,
  onUpdate,
  onAddTag,
  onRemoveTag,
  allTags,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const tagInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const tagPopupRef = useRef<HTMLDivElement>(null)
  const todoItemRef = useRef<HTMLDivElement>(null)
  const [showAbove, setShowAbove] = useState(false)

  const priorityColors = {
    high: 'bg-red-50 border-red-200 hover:bg-red-100',
    medium: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
    low: 'bg-green-50 border-green-200 hover:bg-green-100',
  }

  const categoryColors = {
    Development: 'text-purple-600 bg-purple-100',
    Bugs: 'text-red-600 bg-red-100',
    Feature: 'bg-blue-100 text-blue-600',
    Design: 'text-green-600 bg-green-100',
  }

  // Get existing tags once
  const existingTags = useMemo(
    () => Array.from(allTags).filter((tag) => !todo.tags?.includes(tag)),
    [allTags, todo.tags],
  )

  // Update filtered tags when search changes
  useEffect(() => {
    if (newTag.trim()) {
      const filtered = existingTags.filter((tag) => tag.toLowerCase().includes(newTag.toLowerCase()))
      setFilteredTags(filtered)
    } else {
      setFilteredTags(existingTags)
    }
  }, [newTag, existingTags]) // Only depend on newTag and existingTags

  // Update edit text when todo changes
  useEffect(() => {
    setEditText(todo.text)
  }, [todo.text])

  // Handle popup position
  useEffect(() => {
    const updatePopupPosition = () => {
      if (todoItemRef.current && tagPopupRef.current) {
        const todoRect = todoItemRef.current.getBoundingClientRect()
        const popupHeight = tagPopupRef.current.offsetHeight
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - todoRect.bottom
        setShowAbove(spaceBelow < popupHeight + 10)
      }
    }

    if (isAddingTag) {
      updatePopupPosition()
      window.addEventListener('scroll', updatePopupPosition, true)
      window.addEventListener('resize', updatePopupPosition)
    }

    return () => {
      window.removeEventListener('scroll', updatePopupPosition, true)
      window.removeEventListener('resize', updatePopupPosition)
    }
  }, [isAddingTag]) // Only depend on isAddingTag

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isAddingTag && tagPopupRef.current && !tagPopupRef.current.contains(e.target as Node)) {
        setIsAddingTag(false)
        setNewTag('')
      }
    }

    if (isAddingTag) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAddingTag]) // Only depend on isAddingTag

  // Focus tag input when adding
  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus()
    }
  }, [isAddingTag]) // Only depend on isAddingTag

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim()) {
      onAddTag(todo.id, newTag.trim())
      setNewTag('')
      setIsAddingTag(false)
    }
  }

  const handleTagSelect = (tag: string) => {
    onAddTag(todo.id, tag)
    setNewTag('')
    setIsAddingTag(false)
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsAddingTag(false)
      setNewTag('')
    } else if (e.key === 'ArrowDown' && filteredTags.length > 0) {
      e.preventDefault()
      const firstTag = dropdownRef.current?.querySelector('button')
      firstTag?.focus()
    }
  }

  const handleClick = () => setIsEditing(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      if (e.key === 'Enter') {
        onUpdate(todo.id, editText)
      }
      setIsEditing(false)
      setEditText(todo.text)
    }
  }

  const handleBlur = () => {
    onUpdate(todo.id, editText)
    setIsEditing(false)
  }

  return (
    <div
      ref={todoItemRef}
      className="dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 group relative rounded-xl border p-3 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <button onClick={() => onCheckedChange(todo.id)} className="mt-1 flex-shrink-0 focus:outline-none">
          {todo.status === 'completed' ? (
            <CheckCircle2 className="dark:text-blue-400 h-5 w-5 text-blue-500" />
          ) : (
            <Circle className="dark:group-hover:text-blue-400 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {isEditing ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400 flex-grow rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <span
                className={`cursor-pointer truncate text-base font-medium ${todo.status === 'completed'
                    ? 'dark:text-gray-500 text-gray-400 line-through'
                    : 'dark:text-gray-100 text-gray-900'
                  }`}
                onClick={() => setIsEditing(true)}
              >
                {todo.text}
              </span>
            )}
          </div>

          {/* Updated Tags display with better spacing */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {todo.tags.map((tag) => (
                <span
                  key={tag}
                  className="dark:bg-blue-900/30 dark:text-blue-300 group/tag inline-flex items-center rounded-full bg-blue-100/80 text-xs font-medium text-blue-700"
                >
                  <span className="px-2 py-0.5">#{tag}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveTag(todo.id, tag)
                    }}
                    className="dark:hover:bg-blue-800 w-0 overflow-hidden rounded-r-full transition-all duration-200 hover:bg-blue-200 group-hover/tag:w-4"
                  >
                    <X className="mx-0.5 h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {todo.assignedBy && (
            <div className="mt-1 flex items-center gap-1">
              <UserIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Assigned by {todo.assignedBy}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={() => setIsAddingTag(true)}
          >
            <Tag className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-red-600 p-1 text-gray-500"
            onClick={() => onDelete(todo.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tag Popup */}
      {isAddingTag && (
        <div
          ref={tagPopupRef}
          className={`absolute ${showAbove ? 'bottom-full mb-2' : 'top-full mt-2'
            } dark:bg-gray-800 dark:shadow-gray-900/50 right-0 z-10 rounded-lg bg-white shadow-lg`}
        >
          <div className="p-2">
            <form onSubmit={handleTagSubmit} className="flex items-center gap-2">
              <Input
                ref={tagInputRef}
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 w-48 text-sm"
                autoFocus
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="dark:text-blue-400 dark:hover:text-blue-300 text-blue-600 hover:text-blue-700"
              >
                Add
              </Button>
            </form>
          </div>

          {/* Existing Tags Dropdown */}
          {filteredTags.length > 0 && (
            <div ref={dropdownRef} className="dark:border-gray-700 overflow-y-auto border-t p-1">
              {filteredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className="dark:text-gray-200 dark:hover:bg-gray-700/50 dark:focus:bg-gray-700/50 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DetectedTasksCard({ tasks, onAccept, onDecline }: DetectedTasksCardProps) {
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.metadata.lastModified).getTime() - new Date(a.metadata.lastModified).getTime(),
  )

  if (sortedTasks.length === 0) return null

  return (
    <Card className="dark:bg-gray-900/80 dark:ring-1 dark:ring-white/10 w-80 overflow-hidden rounded-2xl border-0 bg-white/80 shadow-xl backdrop-blur-lg">
      <div className="dark:bg-gray-900 dark:border-gray-800 border-b bg-white p-4">
        <h2 className="dark:text-gray-100 text-lg font-semibold text-gray-900">Detected Tasks</h2>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div key={task.id} className="dark:border-gray-700 dark:bg-gray-800/50 rounded-lg border bg-white/50 p-3">
              <p className="dark:text-gray-300 mb-3 text-sm text-gray-700">{task.text}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAccept(task)}
                  className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-green-800 dark:text-green-400 dark:hover:text-green-300 flex-1"
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDecline(task)}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:text-red-300 flex-1"
                >
                  <X className="mr-1 h-4 w-4" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function Todo() {
  const lastAppsCheckTime = useRef(0)
  const lastConversationsCheckTime = useRef(0)
  const [todos, setTodos] = useState<Task[]>([])
  const [newTodo, setNewTodo] = useState('')
  const { name, handleNameUpdate } = useName() // Destructure name and handleNameUpdate from the context
  const [userName, setUserName] = useState(name)
  const nameRef = useRef(name) // Ref to hold the current name
  const [searchQuery, setSearchQuery] = useState('')
  const [inputText, setInputText] = useState('')

  const [isEditingName, setIsEditingName] = useState(false)
  const [showCompletedTodos, setShowCompletedTodos] = useState(false)
  const [showHelpSection, setShowHelpSection] = useState(false)
  const [hotKey, setHotKey] = useState('')
  const [slmCapable, setSlmCapable] = useState(false)
  const [newTaskText, setNewTaskText] = useState('')

  const tasksTableName = 'tasks'
  const sourcesTableName = 'sources'
  const detectedTasksTableName = 'detectedTasks'

  const [allTags, setAllTags] = useState<Set<string>>(new Set())
  const [activeTag, setActiveTag] = useState<string>('all')
  const [isAddingTag, setIsAddingTag] = useState<{ todoId: string; isOpen: boolean }>({ todoId: '', isOpen: false })

  const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([])

  useEffect(() => {
    nameRef.current = name
  }, [name])

  useEffect(() => {
    Highlight.permissions.requestBackgroundPermission()
  }, [])

  useEffect(() => {
    const getShowHelpSection = async () => {
      const showHelp = (await Highlight.appStorage.get('showHelpSection')) ?? true
      setShowHelpSection(showHelp)
    }
    getShowHelpSection()
  }, [])

  useEffect(() => {
    const isSlmCapable = async () => {
      setSlmCapable(await Highlight.inference.isSlmCapable())
    }
    isSlmCapable()
  }, [])

  useEffect(() => {
    const getHotKey = async () => {
      const hotKey = await Highlight.app.getHotkey()
      setHotKey(hotKey)
    }
    getHotKey()
  }, [])

  const handleUserNameEdit = () => {
    setIsEditingName(true)
  }
  const handleUserNameSave = (newName: string) => {
    handleNameUpdate(newName)
    setIsEditingName(false)
  }

  // Load tasks from the VectorDB
  const loadTasks = async () => {
    try {
      const tasks = await Highlight.vectorDB.getAllItems(tasksTableName)
      const taskObjects = tasks.map((task) => ({
        id: task.id,
        text: task.text,
        status: task.metadata.status,
        additionMethod: task.metadata.additionMethod,
        lastModified: task.metadata.lastModified,
        fadingOut: false,
        priority: task.metadata.priority,
        sourceId: task.metadata.sourceId,
        tags: task.metadata.tags || [], // Ensure tags is always an array
        assignedBy: task.metadata.assignedBy || 'unknown',
      }))

      // Collect all unique tags from tasks
      const tagsSet = new Set<string>()
      taskObjects.forEach((task) => {
        if (task.tags) {
          task.tags.forEach((tag: string) => tagsSet.add(tag.toLowerCase()))
        }
      })

      setTodos(taskObjects)
      setAllTags(tagsSet) // Update allTags with collected tags
    } catch (error) {
      console.log('Error getting tasks: ', error)
    }
  }

  const loadDetectedTasks = async () => {
    try {
      const tasks = await Highlight.vectorDB.getAllItems(detectedTasksTableName)
      const pendingTasks = tasks.filter((task) => task.metadata.status === 'pending')

      // Only update state if there are pending tasks
      if (pendingTasks.length > 0) {
        setDetectedTasks(pendingTasks)
        console.log('Loaded pending detected tasks:', pendingTasks)
      }
    } catch (error) {
      console.error('Failed to load detected tasks:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadTasks(), loadDetectedTasks()])
    }
    init()
  }, [])

  const isDuplicateTask = async (taskText: string, userPrompt: string): Promise<boolean> => {
    // Search for only the most similar task
    const similarTasks = await Highlight.vectorDB.vectorSearch(tasksTableName, taskText, 1)

    if (similarTasks.length > 0 && Math.abs(similarTasks[0].distance) < 0.3) {
      const task = similarTasks[0]
      const metadata = JSON.parse(task.metadata)
      const existingSourceId = metadata.sourceId

      // If task is pending, mark as duplicate immediately
      if (metadata.status === 'pending') {
        console.log('Similar task is already pending - marking as duplicate')
        return true
      }

      if (userPrompt == 'conversations') {
        return true
      }

      // Get source similarity if sourceId exists
      if (existingSourceId) {
        const existingSources = await Highlight.vectorDB.getAllItems(sourcesTableName)
        const existingSource = existingSources.find((source) => source.metadata.sourceId === existingSourceId)
        const existingSourceVector = existingSource?.vector

        let newSourceEmbedding
        try {
          newSourceEmbedding = await Highlight.inference.getEmbedding(userPrompt)
        } catch (error) {
          console.error('Error getting new source embedding: ', error)
          return false
        }

        const similarity = cosineSimilarity(existingSourceVector, newSourceEmbedding)

        // Case 1: Task is completed/deleted and source is similar - mark as duplicate
        if ((metadata.status === 'completed' || metadata.status === 'deleted') && similarity > 0.85) {
          console.log('Task already completed with similar source - marking as duplicate')
          return true
        }

        // Case 2: Task is completed/deleted but source is different - allow new task creation
        if ((metadata.status === 'completed' || metadata.status === 'deleted') && similarity <= 0.85) {
          console.log('Task was completed but has new source - allowing new task creation')
          return false
        }
      }
    }

    // Then check detected tasks
    const similarDetectedTasks = await Highlight.vectorDB.vectorSearch(detectedTasksTableName, taskText, 1)
    Highlight.vectorDB.updateMetadata
    if (similarDetectedTasks.length > 0 && Math.abs(similarDetectedTasks[0].distance) < 0.3) {
      console.log('Similar task already detected - skipping')
      return true
    }

    return false
  }

  const addTask = async (task: DetectedTask) => {
    Highlight.app.showNotification('New task detected:', task.text)
    await Highlight.vectorDB.insertItem(tasksTableName, task.text, task.metadata)

    if (task.metadata.status === 'pending') {
      loadTasks()
    }
  }

  const storeDetectedTask = async (taskText: string, assignedBy: string, userPrompt: string) => {
    try {
      const sourceId = uuidv4()
      await Highlight.vectorDB.insertItem(sourcesTableName, userPrompt, { sourceId })
      await Highlight.vectorDB.insertItem(detectedTasksTableName, taskText, {
        status: 'pending',
        additionMethod: 'automatically',
        lastModified: new Date().toISOString(),
        sourceId,
        assignedBy,
      })

      // Get the task ID from the DB
      const tasks = await Highlight.vectorDB.getAllItems(detectedTasksTableName)
      const task = tasks.find((t) => t.text === taskText)
      if (!task) throw new Error('Failed to find newly created task')

      const newTask: DetectedTask = {
        id: task.id,
        metadata: task.metadata,
        text: task.text,
      }

      setDetectedTasks((prev) => [...prev, newTask])
    } catch (error) {
      console.error('Failed to store detected task:', error)
      return null
    }
  }

  const handleAcceptTask = async (task: DetectedTask) => {
    await addTask(task)
    await Highlight.vectorDB.updateMetadata(detectedTasksTableName, task.id, {
      additionMethod: 'automatically',
      assignedBy: task.metadata.assignedBy || 'unknown',
      lastModified: new Date().toISOString(),
      sourceId: task.metadata.sourceId,
      status: 'accepted',
    })
    setDetectedTasks((prev) => prev.filter((t) => t.id !== task.id))
  }

  const handleDeclineTask = async (task: DetectedTask) => {
    await Highlight.vectorDB.updateMetadata(detectedTasksTableName, task.id, {
      additionMethod: 'automatically',
      assignedBy: task.metadata.assignedBy || 'unknown',
      lastModified: new Date().toISOString(),
      sourceId: task.metadata.sourceId,
      status: 'declined',
    })
    setDetectedTasks((prev) => prev.filter((t) => t.id !== task.id))
  }

  // Helper function to calculate cosine similarity
  function cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0)
    const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0))
    const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0))
    return dotProduct / (magnitude1 * magnitude2)
  }

  useEffect(() => {
    const destructor = Highlight.app.addListener('onContext', async (context: HighlightContext) => {
      if (context.suggestion) {
        addTask({
          id: uuidv4(),
          metadata: { status: 'pending', additionMethod: 'semi_automatically' },
          text: context.suggestion,
        })
      }
    })

    return () => {
      destructor()
    }
  })

  const grammar = `
    root ::= ("Task not assigned" | "Task assigned : " single-line)
    single-line ::= [^\n.]+ ("." | "\n")
    `

  useEffect(() => {
    const onPeriodicForegroundAppCheck = async (context: FocusedWindow) => {
      if (!slmCapable) return

      const now = Date.now()
      if (now - lastAppsCheckTime.current >= 15000) {
        lastAppsCheckTime.current = now

        console.log('Starting periodic apps check...')

        // Handle apps flow first
        const supportedApps = [
          // Chat/Team Apps
          'Slack',
          // "Messages",
          'app.slack.com',
          'Microsoft Teams',
          'teams.microsoft.com',
          // "Discord",
          // "discord.com",
          'Telegram',
          'telegram.org',
          'WhatsApp',
          'web.whatsapp.com',

          // Email Apps
          'Outlook',
          'outlook.office.com',
          'mail.google.com',
          'Superhuman',
          'Mail',
          'ProtonMail',
          'mail.proton.me',
          'Thunderbird',
        ]
        if (supportedApps.some((app) => context.appName === app || (context.url && context.url.includes(app)))) {
          console.log('Processing supported app:', context.appName || context.url)
          const userContext = await Highlight.user.getContext(true)
          const screenContent = userContext.environment.ocrScreenContents ?? ''

          const userCount = (screenContent.match(new RegExp(`\\b${nameRef.current.split(' ')[0]}\\b`, 'gi')) || [])
            .length
          if (userCount < 1) {
            console.log('User not found in screen content, skipping SLM call')
            return
          }

          // Check for duplicate screen content
          const isDuplicateScreen = false // await isDuplicateTask(screenContent, screenContent)
          if (!isDuplicateScreen) {
            let user_prompt = `Name of the User : ${nameRef.current}.\nConversation : ${screenContent}`
            const slmTask = await Highlight.inference.getTextPredictionSlm(
              [
                { role: 'system', content: tasks_system_prompt_slm },
                { role: 'user', content: user_prompt },
              ],
              grammar,
            )

            if (slmTask.startsWith('Task assigned : ')) {
              const slmTaskText = slmTask.replace('Task assigned : ', '')
              console.log('SLM found potential task:', slmTaskText)

              const isDuplicateSlmTask = await isDuplicateTask(slmTaskText, user_prompt)
              if (!isDuplicateSlmTask) {
                console.log('Running LLM verification...')
                user_prompt = `Todays Date: ${new Date().toISOString().split('T')[0]}.\n${user_prompt}`
                const generator = Highlight.inference.getTextPrediction([
                  { role: 'system', content: tasks_system_prompt_llm },
                  { role: 'user', content: user_prompt },
                ])

                let llmTask = ''
                for await (const part of generator) {
                  llmTask += part
                }

                if (llmTask.includes('Task assigned : ')) {
                  let llmTaskText = llmTask.replace(/Task assigned\s*:\s*/, '')
                  const llmAssignedBy = llmTaskText.split(' Assigned by ')[1].replace(',', '').trim()
                  llmTaskText = llmTaskText.split(' Assigned by ')[0].replace(',', '').trim()
                  if (llmAssignedBy.split(' ')[0] == nameRef.current.split(' ')[0]) {
                    console.log('LLM task assigned to self, skipping addition')
                    return
                  }

                  console.log('LLM verified task:', llmTaskText)

                  const isDuplicateLlmTask = await isDuplicateTask(llmTaskText, user_prompt)
                  if (!isDuplicateLlmTask) {
                    await storeDetectedTask(llmTaskText, llmAssignedBy, user_prompt)
                  } else {
                    console.log('Duplicate LLM task detected from apps, skipping addition')
                  }
                } else {
                  console.log('No task found by LLM')
                }
              } else {
                console.log('Duplicate SLM task detected from apps, skipping LLM call')
              }
            } else {
              console.log('No task found in SLM')
            }
          } else {
            console.log('Duplicate screen content detected, skipping SLM call')
          }
        }
        console.log('Periodic check for apps completed')
      }

      if (now - lastConversationsCheckTime.current >= 300000) {
        lastConversationsCheckTime.current = now

        console.log('Starting periodic conversations check...')

        // Then handle conversations flow independently
        // Log available conversations first
        const sevenMinsAgo = new Date(now - 7 * 60 * 1000)
        const conversations = await Highlight.conversations.getAllConversations()

        const recentConversations = conversations.filter((conv) => new Date(conv.endedAt) > sevenMinsAgo)
        if (recentConversations.length > 0) {
          const recentTranscripts = recentConversations
            .slice(0, 2)
            .map((conv, index) => `Transcript ${index + 1}:\n${conv.transcript}`)
            .join('\n\n---\n\n')

          // Check if conversation is one-sided
          const selfCount = (recentTranscripts.match(/self:/gi) || []).length
          // change other to other(s):
          const otherCount = (recentTranscripts.match(/other\(s\):/gi) || []).length

          // If only self messages or no messages at all, skip processing
          if (selfCount > 0 && otherCount === 0) {
            console.log('Skipping one-sided conversation')
            return
          }

          const isDuplicateInput = false //await isDuplicateTask(recentTranscripts, recentTranscripts)
          if (!isDuplicateInput) {
            const conversations_prompt = [
              `Name of the User: ${nameRef.current}`,
              `Recent Conversations: ${recentTranscripts}`,
            ].join('\n')

            console.log('Running LLM for conversations for user: ', nameRef.current)
            const user_generator = Highlight.inference.getTextPrediction([
              { role: 'system', content: conversations_system_prompt },
              { role: 'user', content: conversations_prompt },
            ])

            let user_llmTask = ''
            for await (const part of user_generator) {
              user_llmTask += part
            }

            console.log('User LLM task:', user_llmTask)

            const overall_generator = Highlight.inference.getTextPrediction([
              { role: 'system', content: overall_conversations_system_prompt },
              { role: 'user', content: conversations_prompt },
            ])

            let overall_llmTask = ''
            for await (const part of overall_generator) {
              overall_llmTask += part
            }

            console.log('Overall LLM task:', overall_llmTask)

            if (user_llmTask.includes('Task assigned : ')) {
              const taskText = user_llmTask.replace(/Task assigned\s*:\s*/, '')
              console.log('LLM found potential task from conversations:', taskText)

              const isDuplicateLlmTask = await isDuplicateTask(taskText, 'conversations')
              if (!isDuplicateLlmTask) {
                await storeDetectedTask(taskText, 'unknown', 'conversations')
              } else {
                console.log('Duplicate task detected from conversations, skipping addition')
              }
            }
            if (overall_llmTask.startsWith('[') && overall_llmTask.endsWith(']')) {
              try {
                const tasks = overall_llmTask
                  .slice(1, -1)
                  .split('",')
                  .map((task) => task.replace(/^"|"$/g, '').trim())

                console.log('Tasks:', tasks)

                for (const task of tasks) {
                  if (task.includes('Task assigned : ')) {
                    const taskText = task.replace(/Task assigned\s*:\s*/, '').trim()
                    console.log('LLM found potential task from conversations:', taskText)

                    const isDuplicateLlmTask = await isDuplicateTask(taskText, 'conversations')
                    if (!isDuplicateLlmTask) {
                      await storeDetectedTask(taskText, 'unknown', 'conversations')
                    } else {
                      console.log('Duplicate task detected from conversations, skipping addition')
                    }
                  }
                }
              } catch (error) {
                console.error('Failed to parse tasks array:', error)
              }
            } else {
              console.log('No task found in conversations')
            }
          } else {
            console.log('Duplicate conversation detected, skipping LLM call')
          }
        }
        console.log('Periodic check for conversations completed')
      }
    }

    let removeListener = Highlight.app.addListener('onPeriodicForegroundAppCheck', onPeriodicForegroundAppCheck)

    return () => {
      removeListener()
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setInputText(text)
    setSearchQuery(text) // Update search query as user types
  }

  const handleNewTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      await addTask({
        id: uuidv4(),
        metadata: { status: 'pending', additionMethod: 'manually' },
        text: inputText,
      })
      setInputText('') // Clear input after adding task
      setSearchQuery('') // Clear search query
    }
  }

  const updateTodo = async (id: string, text: string) => {
    const todo = todos.find((todo) => todo.id === id)
    await Highlight.vectorDB.updateText(tasksTableName, id, text, {
      status: todo?.status,
      additionMethod: todo?.additionMethod,
      lastModified: new Date().toISOString(),
    })
    loadTasks()
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find((todo) => todo.id === id)
    const newStatus = todo?.status === 'completed' ? 'pending' : 'completed'
    await Highlight.vectorDB.updateMetadata(tasksTableName, id, {
      ...todo,
      status: newStatus,
      lastModified: new Date().toISOString(),
    })
    loadTasks()
  }

  const toggleTodoWithFadeOut = async (id: string) => {
    // Find the todo item and update its 'fadingOut' state temporarily
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, fadingOut: true } // Add a fadingOut property
      }
      return todo
    })
    setTodos(updatedTodos)
    setTimeout(async () => {
      toggleTodo(id)
    }, 1000) // Delay of 1 second for the fade-out effect
  }

  const deleteTodo = async (id: string) => {
    const todo = todos.find((todo) => todo.id === id)
    const additionMethod = todo?.additionMethod
    if (additionMethod === 'automatically') {
      // For automatically added tasks, update the status to 'deleted' instead of deleting, so that we don't add it again
      await Highlight.vectorDB.updateMetadata(tasksTableName, id, {
        status: 'deleted',
        additionMethod: additionMethod,
        lastModified: new Date().toISOString(),
        sourceId: todo?.sourceId,
      })
    } else {
      await Highlight.vectorDB.deleteItem(tasksTableName, id)
    }
    loadTasks()
  }

  const toggleHelp = async () => {
    Highlight.appStorage.set('showHelpSection', !showHelpSection)
    setShowHelpSection(!showHelpSection)
  }

  // Function to add tag to a todo
  const addTagToTodo = async (todoId: string, tag: string) => {
    const todo = todos.find((t) => t.id === todoId)
    if (todo) {
      const newTags = [...(todo.tags || [])]
      if (!newTags.includes(tag.toLowerCase())) {
        newTags.push(tag.toLowerCase())
        await Highlight.vectorDB.updateMetadata(tasksTableName, todoId, {
          ...todo,
          tags: newTags,
          lastModified: new Date().toISOString(),
        })
        loadTasks()

        // Update allTags
        setAllTags((prev) => new Set([...Array.from(prev), tag.toLowerCase()]))
      }
    }
  }

  // Add function to remove tag from a todo
  const removeTagFromTodo = async (todoId: string, tagToRemove: string) => {
    const todo = todos.find((t) => t.id === todoId)
    if (todo) {
      const newTags = todo.tags.filter((tag) => tag !== tagToRemove)
      await Highlight.vectorDB.updateMetadata(tasksTableName, todoId, {
        ...todo,
        tags: newTags,
        lastModified: new Date().toISOString(),
      })

      // Check if this tag is used by any other todos
      const isTagUsedElsewhere = todos.some((t) => t.id !== todoId && t.tags && t.tags.includes(tagToRemove))

      // If tag is not used elsewhere, remove it from allTags
      if (!isTagUsedElsewhere) {
        const updatedTags = new Set(allTags)
        updatedTags.delete(tagToRemove)
        setAllTags(updatedTags)

        // If the removed tag was active, switch to 'all'
        if (activeTag === tagToRemove) {
          setActiveTag('all')
        }
      }

      loadTasks()
    }
  }

  // Filter todos based on active tag and search
  const filteredTodos = todos
    .filter((todo) => {
      const matchesTag = activeTag === 'all' || (todo.tags && todo.tags.includes(activeTag))
      const matchesSearch = searchQuery ? todo.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
      return matchesTag && matchesSearch
    })
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())

  return (
    <div className="to-purple-50 dark:from-gray-900 dark:to-gray-800 h-[calc(100vh-200px)] overflow-y-scroll bg-gradient-to-br from-blue-50 p-8">
      <div className="mx-auto flex max-w-6xl gap-6">
        <Card className="dark:bg-gray-900/80 dark:ring-1 dark:ring-white/10 flex-1 overflow-hidden rounded-2xl border-0 bg-white/80 shadow-xl backdrop-blur-lg">
          {/* Header Section */}
          <div className="dark:bg-gray-900 dark:border-gray-800 border-b bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              {' '}
              {/* Reduced margin */}
              <div className="flex flex-col">
                {' '}
                {/* Changed to flex-col for better alignment */}
                <h1 className="to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-gradient-to-r from-blue-600 bg-clip-text text-3xl font-bold text-transparent">
                  Tasks
                </h1>
                {isEditingName ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameUpdate(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingName(false)
                    }}
                    className="dark:text-gray-400 dark:border-gray-700 dark:focus:border-blue-400 mt-1 border-b border-gray-300 bg-transparent px-0 text-sm text-gray-600 focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="dark:text-gray-400 dark:hover:text-blue-400 mt-1 text-sm text-gray-600 transition-colors hover:text-blue-600"
                  >
                    {name}&apos;s workspace
                  </button>
                )}
              </div>
              <div />
            </div>

            {/* Search/Add Task form */}
            <form onSubmit={handleNewTaskSubmit} className="mt-3 flex items-center gap-4">
              {' '}
              {/* Reduced margin */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="text"
                  placeholder="Add a new task or search..."
                  value={inputText}
                  onChange={handleInputChange}
                  className="dark:bg-gray-800 dark:border-gray-700 w-full pl-10"
                />
              </div>
              <Button
                type="submit"
                className="to-purple-600 bg-gradient-to-r from-blue-600 text-white hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </form>
          </div>

          {/* Main Content */}
          <CardContent className="p-4">
            {' '}
            {/* Reduced padding */}
            {/* Tags filter */}
            {allTags.size > 0 && (
              <div className="mb-2 flex gap-2 overflow-x-auto">
                {' '}
                {/* Reduced margin */}
                <Button
                  variant={activeTag === 'all' ? 'default' : 'ghost'}
                  className={`rounded-full px-4 ${activeTag === 'all'
                      ? 'dark:bg-blue-600 dark:hover:bg-blue-700 bg-blue-600 text-white hover:bg-blue-700'
                      : 'dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-200 hover:bg-gray-100'
                    }`}
                  onClick={() => setActiveTag('all')}
                >
                  All Tasks
                </Button>
                {Array.from(allTags).map((tag) => (
                  <Button
                    key={tag}
                    variant={activeTag === tag ? 'default' : 'ghost'}
                    className={`rounded-full px-4 ${activeTag === tag
                        ? 'dark:bg-blue-600 dark:hover:bg-blue-700 bg-blue-600 text-white hover:bg-blue-700'
                        : 'dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-200 hover:bg-gray-100'
                      }`}
                    onClick={() => setActiveTag(tag)}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            )}
            {/* Tasks list */}
            <div className="dark:bg-gray-800/50 mt-2 space-y-2 rounded-lg bg-white/50 p-3">
              {' '}
              {/* Adjusted spacing */}
              {filteredTodos
                .filter((todo) => todo.status === 'pending')
                .map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onCheckedChange={toggleTodo}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                    onAddTag={addTagToTodo}
                    onRemoveTag={removeTagFromTodo} // Add this
                    allTags={allTags}
                  />
                ))}
            </div>
            {/* Completed Tasks Section */}
            <Collapsible open={showCompletedTodos} onOpenChange={setShowCompletedTodos} className="mt-4">
              <CollapsibleTrigger className="dark:hover:bg-gray-800/50 dark:text-gray-300 flex w-full items-center justify-between rounded-lg p-2 transition-colors duration-200 hover:bg-gray-50">
                <span className="flex items-center gap-2">
                  <ChevronDown className={`h-4 w-4 transition-transform ${showCompletedTodos ? 'rotate-180' : ''}`} />
                  {showCompletedTodos ? 'Hide' : 'Show'} Completed Tasks
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {filteredTodos
                  .filter((todo) => todo.status === 'completed')
                  .map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onCheckedChange={toggleTodo}
                      onDelete={deleteTodo}
                      onUpdate={updateTodo}
                      onAddTag={addTagToTodo}
                      onRemoveTag={removeTagFromTodo} // Add this
                      allTags={allTags}
                    />
                  ))}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <DetectedTasksCard tasks={detectedTasks} onAccept={handleAcceptTask} onDecline={handleDeclineTask} />
      </div>
    </div>
  )
}
