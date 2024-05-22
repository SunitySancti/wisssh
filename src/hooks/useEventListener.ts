import { useEffect, useRef } from "react"

export function useEventListener(
    eventType: keyof WindowEventMap,
    callback: (e: any) => void,
    element?: EventTarget | null
) {
    const callbackRef = useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    },[ callback ])

    useEffect(() => {
        if (!element) return
        const handler = (e: any) => callbackRef.current(e);
        (element || window).addEventListener(eventType, handler)

        return () => (element || window).removeEventListener(eventType, handler)
    },[ eventType,
        element
    ])
}
