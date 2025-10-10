'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

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

    const handleInstallClick = () => {
        if (isIOS) {
            // Show iOS instructions modal
            setShowIOSModal(true)
        } else {
            // For non-iOS devices, show better guidance
            alert('Look for the install button in your browser\'s menu or address bar! On Chrome, look for the install icon next to the bookmark star.')
        }
    }

    if (isStandalone) {
        return null // Don't show install button if already installed
    }

    return (
        <>
            <Button
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                size="sm"
            >
                <span className="text-lg">📱</span>
                Get App
            </Button>

            <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">📱</span>
                            Install Teacher Scheduler
                        </DialogTitle>
                        <DialogDescription>
                            Get the full app experience with faster loading and offline access!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="font-medium text-blue-900 mb-2">Benefits:</div>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>⚡ Faster loading</li>
                                <li>📴 Works offline</li>
                                <li>🏠 Home screen access</li>
                                <li>🔔 Push notifications</li>
                            </ul>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="font-medium">How to install:</div>
                            <div className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <span>Tap the Share button</span>
                                <span className="text-lg" role="img" aria-label="share icon">📤</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <span>Scroll down and tap "Add to Home Screen"</span>
                                <span className="text-lg" role="img" aria-label="plus icon">➕</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                <span>Tap "Add" to confirm</span>
                                <span className="text-lg" role="img" aria-label="checkmark">✅</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default InstallPrompt