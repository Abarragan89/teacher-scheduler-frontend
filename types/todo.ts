export interface TodoItem {
    id: string
    text: string
    completed: boolean
    priority: number
}

export interface TodoList {
    id: string
    listName: string
    isDefault: boolean
    todos: TodoItem[]
}