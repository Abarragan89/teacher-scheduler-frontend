export const closeAllAccordions = (setOpenAccordions: React.Dispatch<React.SetStateAction<string[]>>) => {
    setOpenAccordions([])
}

export const openAccordion = (taskId: string, setOpenAccordions: React.Dispatch<React.SetStateAction<string[]>>) => {
    setOpenAccordions(prev => {
        if (!prev.includes(taskId)) {
            return [...prev, taskId]
        }
        return prev
    })
}

export const toggleAccordion = (taskId: string, openAccordions: string[], setOpenAccordions: React.Dispatch<React.SetStateAction<string[]>>) => {
    setOpenAccordions(prev => {
        if (prev.includes(taskId)) {
            return prev.filter(id => id !== taskId)
        } else {
            return [...prev, taskId]
        }
    })
}