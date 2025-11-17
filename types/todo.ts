export interface TodoItem {
    id: string
    text: string
    completed: boolean
    priority: number
    category?: string    // Optional category field
    todoListId?: string
    dueDate: String | null
    createdAt?: string   // For sorting by creation date
    deleting?: boolean  // For smooth deletion animation
    isNew?: boolean      // For new item slide-in animation
    slideDown?: boolean  // For existing items slide-down animation
}

export interface TodoList {
    id: string
    listName: string
    isDefault: boolean
    todos: TodoItem[]
}