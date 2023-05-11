import React from 'react'
import { useLocation } from 'react-router'

import './styles.scss'
import { Icon } from 'atoms/Icon'

export const Button = ({
    kind,
    text,
    type,
    leftIcon,
    rightIcon,
    round,
    ...rest
}) => {
    const renderLeftIcon = leftIcon && (
        <Icon
            name={ leftIcon }
            size='22'
        />
    );
    const renderRightIcon = rightIcon && (
        <Icon
            name={ rightIcon }
            size='22'
        />
    );

    return (
        <button
            className={ 'button' + ( kind ? ` ${kind}` : ' secondary')}
            style={ round ? {borderRadius: '6px'} : null}
            type={ type || 'button' }
            {...rest}
        >
            { renderLeftIcon }
            { text }
            { renderRightIcon }
        </button>
    );
}

export const WishButton = ({ wish, kind }) => {
    const loca = useLocation().pathname;
    const isMyWish = loca.split('/').at(1) === 'my-wishes';

    const content = (wish.state === 'actual' && isMyWish)
        ? {
            icon: 'ok',
            text: 'Отметить исполненным',
            handleClick: (e) => { e.stopPropagation() },
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
        : undefined

    if(!content) return null;

    return (
        <Button
            kind={ kind || 'secondary' }
            leftIcon={ content.icon }
            text={ content.text }
            disabled={ !!content.disabled }
            onClick={ content.handleClick }
        />
    );
}