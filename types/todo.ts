export interface TodoItem {
    id: string
    text: string
    completed: boolean
}

export interface TodoList {
    id: string
    listName: string
    todos: TodoItem[]
}