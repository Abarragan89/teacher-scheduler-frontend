export interface TodoItem {
    id: string
    text: string
    completed: boolean
    priority: number
    dueDate: String | null
    deleting?: boolean  // For smooth deletion animation
}

export interface TodoList {
    id: string
    listName: string
    isDefault: boolean
    todos: TodoItem[]
}