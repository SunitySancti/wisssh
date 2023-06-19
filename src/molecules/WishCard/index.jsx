import   React,
       { useMemo } from 'react'
import { useNavigate,
         useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import './styles.scss'
import { WishCover,
         WishMenu } from 'molecules/WishStuff'


export const WishCard = ({ data: wish, isInput, value, onChange }) => {
    // value: [...wishIds]
    const selected = value?.includes(wish?.id);

    // STYLES //

    const isProcessing = useSelector(state => state.processing?.wishes[wish?.id]);
    
    const classes = useMemo(() => {
        let result = 'wishcard fade-in';
        if(isInput) result += selected ? ' input selected' : ' input'
        else result += ' view';
        if(isProcessing) result += ' processing'
        
        return result
    },[ isInput, selected, isProcessing ])

    // ELEMENTS //

    const currency = wish?.currency==='rouble' ? ' ₽'
                   : wish?.currency==='usd'    ? ' $'
                   : wish?.currency==='euro'   ? ' €' : '';

    const priceBlock = wish?.price ? (
        <span className='price'>
            {wish?.price + currency}
        </span>
    ) : null

    // METHODS //

    const location = useLocation().pathname
    const section = location.split('/').at(1);
    const slashCorrection = location.at(-1) === '/'
        ? '' : '/'
    const path = location + slashCorrection + wish?.id;
    const navigate = useNavigate();
    const handleCardClick = () => {
        if(isInput) {
            const result = selected
                ? [...value].filter(id => id != wish?.id)
                : value.concat([wish?.id]);
            onChange(result);
        } else navigate(path);
    };

    return (
        <div
            className={ classes }
            key={ wish?.id }
            onClick={ handleCardClick }
        >
            <WishCover wish={ wish } withUserPic={ section === 'my-invites' }/>
            <WishMenu wish={ wish }/>
            <div className='wishcard-content'>
                <span className='title'>{ wish?.title }</span>
                { priceBlock }
            </div>
            { selected &&
                <div className='selection-mask'/>
            }
        </div>
    )
}
