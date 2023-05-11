import   React,
       { useEffect,
         useState } from 'react'
import { useSelector } from 'react-redux'
import { useResizeDetector } from 'react-resize-detector'

import './styles.scss'
import { WishPlaceholder } from 'atoms/Icon'


export const WishCover = ({ wish }) => {
    const [ height, setHeight ] = useState(null);
    const { width, ref } = useResizeDetector()
    const imageURL = useSelector(state => state.images?.imageURLs[wish?.id]);

    useEffect(() => {
        const updateCardHeight = () => {
            const height = Math.ceil(width / wish?.imageAR);
            setHeight( height || null )
        }
        updateCardHeight();
        window.addEventListener('resize', updateCardHeight);
        return () => window.removeEventListener('resize', updateCardHeight);
    },[ width ]);
    
    return (
        <div
            className='image-container'
            style={{ height }}
            ref={ ref }
        >
            { imageURL
                ? <img src={ imageURL }/>
                : <WishPlaceholder/>
            }
        </div>
    )
}
