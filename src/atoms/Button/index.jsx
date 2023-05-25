import   React,{
         useMemo} from 'react'
import { useLocation } from 'react-router'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Spinner } from 'atoms/Spinner'


export const Button = ({
    kind,           // primary || secondary || accent || clear 
    text,
    type,           // submit || button
    icon,           // iconName
    round,          // Boolean
    disabled,
    size,           // this prop for icon button
    className,
    style,
    isLoading,      // Boolean
    spinnerSize,    // in rem
    spinnerTheme,   // primary || light || dark
    spinnerWidth,   // in px
    ...rest
}) => {
    const classes = useMemo(() => {
        if(!text) {
            return className ? 'icon-button ' + className : 'icon-button'
        };
        let result = 'button';
        if(kind) { result += ' ' + kind } else { result += ' secondary' };
        if(round) result += ' round';
        if(isLoading) result += ' loading';
        return result
    },[ text, kind, round, isLoading ]);
    
    const spinnerProps = {
        size: spinnerSize || 4,
        colorTheme: spinnerTheme || 'dark',
        strokeWidth: spinnerWidth || 6,
    }
    const styles = text
        ? style
        : {
            width: `${size || 4}rem`,
            height: `${size || 4}rem`,
            ...style
        }

    return (
        <button
            className={ classes }
            style={ styles }
            type={ type || 'button' }
            disabled={ isLoading || disabled }
            {...rest}
        >
            { icon && <Icon name={ icon } size={ size ? size : '22' }/> }
            { text && text }
            { isLoading && <Spinner {...spinnerProps}/> }
        </button>
    )
}

export const WishButton = ({ wish, kind }) => {
    const loca = useLocation().pathname;
    const isMyWish = loca.split('/').at(1) === 'my-wishes';

    const buttonProps = (wish.state === 'actual' && isMyWish)
        ? {
            icon: 'ok',
            text: 'Отметить исполненным',
            onClick: (e) => { e.stopPropagation() },
        }
        : (wish.state === 'actual' && !isMyWish)
        ? {
            icon: 'present',
            text: 'Исполнить желание',
        }
        : (wish.state === 'reserved')
        ? {
            icon: 'lock',
            text: 'Зарезервировано',                
            disabled: true,
        }
        : (wish.state === 'completed')
        ? {
            icon: 'ok',
            text: 'Желание исполнено',
            disabled: true,
        }
        : {}

    if(!buttonProps) return null;

    return <Button kind={ kind } {...buttonProps} />
}