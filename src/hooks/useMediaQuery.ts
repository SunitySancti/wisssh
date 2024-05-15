import { useState, useEffect } from "react"
import { useEventListener } from "./useEventListener"

export function useMediaQuery(mediaQuery: string) {
    const [isMatch, setIsMatch] = useState(false)
    const [mediaQueryList, setMediaQueryList] = useState<MediaQueryList | undefined>(undefined)

    useEffect(() => {
        const list = window.matchMedia(mediaQuery)
        setMediaQueryList(list)
        setIsMatch(list.matches)
    }, [mediaQuery])

    useEventListener("change", e => setIsMatch(e?.matches), mediaQueryList)

    return isMatch
}
