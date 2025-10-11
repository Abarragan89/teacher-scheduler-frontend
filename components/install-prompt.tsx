'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dock, MonitorDownIcon, Share } from 'lucide-react'
import { ResponsiveDialog } from './responsive-dialog'
import { MdOutlineAddBox } from "react-icons/md";


interface PlatformInfo {
    isIOS: boolean
    isAndroid: boolean
    isMac: boolean
    isWindows: boolean
    isSafari: boolean
    isChrome: boolean
    isFirefox: boolean
    isEdge: boolean
}

function InstallPrompt() {
    const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
        isIOS: false,
        isAndroid: false,
        isMac: false,
        isWindows: false,
        isSafari: false,
        isChrome: false,
        isFirefox: false,
        isEdge: false
    })
    const [isStandalone, setIsStandalone] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    useEffect(() => {
        const detectPlatform = () => {
            const userAgent = navigator.userAgent
            const platform = navigator.platform

            setPlatformInfo({
                // Mobile platforms
                isIOS: /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream,
                isAndroid: /Android/.test(userAgent),

                // Desktop platforms
                isMac: /Mac|Macintosh/.test(platform),
                isWindows: /Win/.test(platform),

                // Browsers
                isSafari: /Safari/.test(userAgent) && !/Chrome|Chromium|Edge/.test(userAgent),
                isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent),
                isFirefox: /Firefox/.test(userAgent),
                isEdge: /Edge|Edg/.test(userAgent)
            })
        }

        const checkStandalone = () => {
            const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone ||
                document.referrer.includes('android-app://')
            setIsStandalone(standalone)
        }

        // Listen for the beforeinstallprompt event (Chrome/Edge)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }

        detectPlatform()
        checkStandalone()

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        // If we have a deferred prompt (Chrome/Edge), use it
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            console.log(`User response to install prompt: ${outcome}`)
            setDeferredPrompt(null)
        } else {
            // Otherwise show manual instructions
            setShowModal(true)
        }
    }

    const getInstallInstructions = () => {
        // iOS Safari (iPhone/iPad)
        if (platformInfo.isIOS && platformInfo.isSafari) {
            return {
                title: "Install on iOS Safari",
                steps: [
                    { icon: <Share />, text: "Tap the Share button" },
                    { icon: <MdOutlineAddBox />, text: "Scroll down and tap 'Add to Home Screen'" },
                    { icon: "✅", text: "Tap 'Add' to confirm" }
                ]
            }
        }

        // macOS Safari (Desktop)
        if (platformInfo.isMac && platformInfo.isSafari) {
            return {
                title: "Install on macOS Safari",
                steps: [
                    { icon: <Share />, text: "Click 'Share' icon" },
                    { icon: <Dock />, text: "Click 'Add to Dock'" },
                ]
            }
        }

        // Android Chrome
        if (platformInfo.isAndroid && platformInfo.isChrome) {
            return {
                title: "Install on Android Chrome",
                steps: [
                    { icon: "⋮", text: "Tap the menu button (⋮)" },
                    { icon: "📱", text: "Tap 'Add to Home screen'" },
                    { icon: "✅", text: "Tap 'Add' to confirm" }
                ]
            }
        }

        // Android Firefox
        if (platformInfo.isAndroid && platformInfo.isFirefox) {
            return {
                title: "Install on Android Firefox",
                steps: [
                    { icon: "⋮", text: "Tap the menu button (⋮)" },
                    { icon: "📱", text: "Tap 'Install'" },
                    { icon: "✅", text: "Tap 'Add to Home screen'" }
                ]
            }
        }

        // Windows Chrome/Edge
        if (platformInfo.isWindows && (platformInfo.isChrome || platformInfo.isEdge)) {
            return {
                title: `Install on Windows ${platformInfo.isChrome ? 'Chrome' : 'Edge'}`,
                steps: [
                    { icon: <MonitorDownIcon />, text: "Click download icon in the address bar" },
                    { icon: "✅", text: "Click 'Install' to confirm" }
                ]
            }
        }

        // macOS Chrome/Edge
        if (platformInfo.isMac && (platformInfo.isChrome || platformInfo.isEdge)) {
            return {
                title: `Install on macOS ${platformInfo.isChrome ? 'Chrome' : 'Edge'}`,
                steps: [
                    { icon: <MonitorDownIcon />, text: "Click download icon in the address bar" },
                    { icon: "✅", text: "Click 'Install' to confirm" }
                ]
            }
        }

        // Firefox (any platform)
        if (platformInfo.isFirefox) {
            return {
                title: "Install on Firefox",
                steps: [
                    { icon: "📋", text: "Click the menu button (☰)" },
                    { icon: "📱", text: "Look for 'Install' option (if available)" },
                    { icon: "🔖", text: "Or bookmark this page for quick access" }
                ],
                note: "Firefox has limited PWA support. Consider using Chrome or Edge for full app experience."
            }
        }

        // Generic fallback
        return {
            title: "Install Instructions",
            steps: [
                { icon: "🔍", text: "Look for an install icon in your browser's address bar" },
                { icon: "📋", text: "Check your browser menu for 'Install' or 'Add to Home screen'" },
                { icon: "🔖", text: "Or bookmark this page for quick access" }
            ]
        }
    }

    if (isStandalone) {
        return null // Don't show if already installed
    }

    const instructions = getInstallInstructions()

    return (
        <>
            <Button onClick={handleInstallClick}>
                Install App
            </Button>

            <ResponsiveDialog
                isOpen={showModal}
                setIsOpen={setShowModal}
                title={instructions.title}
                description="Get faster loading and push notifications!"
            >
                <div className="space-y-4">
                    <div className="space-y-3 text-sm mt-4 mb-2">
                        {instructions.steps.map((step, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="text-lg flex-shrink-0">
                                    {typeof step.icon === 'string' ? step.icon : step.icon}
                                </span>
                                <span className="flex-1">{step.text}</span>
                            </div>
                        ))}
                    </div>

                    {instructions.note && (
                        <div className="mt-4 p-3 bg-muted rounded-md text-xs text-muted-foreground">
                            <strong>Note:</strong> {instructions.note}
                        </div>
                    )}

                    {deferredPrompt && (
                        <div className="mt-4 p-3 rounded-md text-xs">
                            <strong>Tip:</strong> Your browser supports one-click installation!
                            The install button should work automatically.
                        </div>
                    )}
                </div>
            </ResponsiveDialog>
        </>
    )
}

export default InstallPrompt