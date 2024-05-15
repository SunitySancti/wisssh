import { memo,
         useMemo } from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Spinner } from 'atoms/Preloaders'

import type { MouseEvent } from 'react'
import type { IconName } from 'atoms/Icon'


export interface ButtonProps {
    text?: string;
    icon?: IconName;
    kind?: 'primary' | 'secondary' | 'accent' | 'clear' | 'negative primary';
    type?: 'submit' | 'button';
    round?: boolean;
    disabled?: boolean;
    size?: number;
    className?: string;
    isLoading?: boolean;
    spinnerTheme?: 'primary' | 'light' | 'dark';
    spinnerSize?: number;
    spinnerWidth?: number;
    id?: string;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter?: (e: MouseEvent<HTMLButtonElement>) => void;
    onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void
}


export const Button = memo(({
    kind,
    text,
    type,
    icon,
    round,
    disabled,
    size = 4,       // size in rem for icon button
    className,
    isLoading,
    spinnerTheme,
    spinnerSize,    // in rem
    spinnerWidth,   // in px
    id,
    onClick,
    onMouseEnter,
    onMouseLeave
} : ButtonProps
) => {
    const classes = useMemo(() => {
        let result = text ? 'button' : 'icon-button';
        if(className) result += (' ' + className);
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

    return (
        <button {...{
            className: classes,
            type: type || 'button',
            disabled: isLoading || disabled,
            id,
            onClick,
            onMouseEnter,
            onMouseLeave
        }}>
            { icon &&
                <Icon name={ icon } size={ text ? 22 : size * 11 }/>
            }
            { !!text && text }
            { isLoading &&
                <Spinner {...spinnerProps}/>
            }
        </button>
    )
})
