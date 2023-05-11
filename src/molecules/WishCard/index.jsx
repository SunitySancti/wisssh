import   React,
       { useMemo } from 'react'
import { useNavigate,
         useLocation } from 'react-router-dom'

import './styles.scss'
import { WishButton } from 'atoms/Button'
import { WishCover } from 'atoms/WishCover'
import { StarRating } from 'inputs/StarRating'


export const WishCard = ({ data, ...rest }) => {
    const wish = data;
    const { isInput, value, onChange } = rest
    const selected = value?.includes(wish.id)
    // value: [...wishIds]
    if(!wish) return null;

    const SelectionMask = () => <div className='selection-mask'/>

    // styling:
    
    const classes = useMemo(() => {
        let result = 'wishcard fade-in';
        if(isInput) result += selected ? ' input selected' : ' input'
        else result += ' view';
        
        return result
    },[ isInput, selected ])

    // model:

    const currency = wish.currency==='rouble' ? ' ₽'
                   : wish.currency==='usd'    ? ' $'
                   : wish.currency==='euro'   ? ' €' : '';

    const priceBlock = wish.price ? (
        <span className='price'>
            {wish.price + currency}
        </span>
    ) : null

    // methods:

    const location = useLocation().pathname
    const slashCorrection = location.at(-1) === '/'
        ? '' : '/'
    const path = location + slashCorrection + wish.id;
    const navigate = useNavigate();
    const handleCardClick = () => {
        if(isInput) {
            const result = selected
                ? [...value].filter(id => id != wish.id)
                : value.concat([wish.id]);
            onChange(result);
        } else navigate(path);
    };

    return (
        <div
            className={ classes }
            key={ wish.id }
            onClick={ handleCardClick }
        >
            <StarRating
                readOnly
                rating={ wish.stars }
            />
            <WishCover wish={ wish }/>
            <div className='wishcard-content'>
                <span className='title'>{ wish.title }</span>
                { priceBlock }
            </div>
            {
                !isInput &&
                <WishButton wish={ wish }/>
            }{
                selected &&
                <SelectionMask/>
            }
        </div>
    )
}
