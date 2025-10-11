import { Button } from '@/components/ui/button'
import React from 'react'

export default function YesterdayTomorrowNav() {
  return (
    <div className="flex flex-start">
        <Button variant={"ghost"} size="sm" className="px-2">
            Yesterday
        </Button>
        <Button variant={"ghost"} size="sm" className="px-2">
            Tomorrow
        </Button>
    </div>
  )
}
