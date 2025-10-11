'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Share } from 'lucide-react'
import { ResponsiveDialog } from './responsive-dialog'

function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const [showIOSModal, setShowIOSModal] = useState(false)

    useEffect(() => {
        const checkPlatform = () => {
            setIsIOS(
                /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
            )
        }

        const checkStandalone = () => {
            // Check multiple indicators for better detection
            const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone || // iOS Safari
                document.referrer.includes('android-app://') // Android
            setIsStandalone(standalone)
        }

        checkPlatform()
        checkStandalone()
    }, [])

    if (isStandalone) {
        return null // Don't show install button if already installed
    }

    return (
        <>
            <Button
                onClick={() => setShowIOSModal(true)}
                size="sm"
            >
                Get App
            </Button>

            <ResponsiveDialog
                isOpen={showIOSModal}
                setIsOpen={setShowIOSModal}
                title='Install Teacher Scheduler'
                description='Push notifications and faster loading!'
            >
                <div className="space-y-4">
                    {isIOS ? (
                        <>
                            <div className="space-y-3 text-sm">
                                <div className="font-medium">How to install:</div>
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                    <span>Tap the Share button</span>
                                    <span className="text-lg" role="img" aria-label="share icon"><Share /></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    <span>Scroll down and tap "Add to Home Screen"</span>
                                    <span className="text-lg" role="img" aria-label="plus icon">➕</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-ring rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                    <span>Tap "Add" to confirm</span>
                                    <span className="text-lg" role="img" aria-label="checkmark">✅</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <div className="space-y-3 text-sm">
                                <div className="font-medium">How to install:</div>
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                    <span>Tap the menu button (⋮) in your browser</span>
                                    <span className="text-lg" role="img" aria-label="menu icon">⋮</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    <span>Look for "Add to Home screen" or "Install app"</span>
                                    <span className="text-lg" role="img" aria-label="plus icon">📱</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-ring rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                    <span>Tap "Add" or "Install" to confirm</span>
                                    <span className="text-lg" role="img" aria-label="checkmark">✅</span>
                                </div>
                                <div className="mt-3 p-3 bg-muted rounded-md text-xs text-muted-foreground">
                                    <strong>Note:</strong> On desktop browsers, look for an install icon (⊕) in the address bar, or check the browser menu for "Install Teacher Scheduler" option.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ResponsiveDialog>

        </>
    )
}

export default InstallPrompt