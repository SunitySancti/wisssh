import { useMemo } from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Spinner } from 'atoms/Preloaders'

import type { IconName } from 'atoms/Icon'


export interface ButtonProps {
    kind?: 'primary' | 'secondary' | 'accent' | 'clear' | 'negative primary';
    text?: string;
    type?: 'submit' | 'button';
    icon?: IconName;
    round?: boolean;
    disabled?: boolean;
    size?: number;
    className?: string;
    style?: object;
    isLoading?: boolean;
    spinnerTheme?: 'primary' | 'light' | 'dark';
    spinnerSize?: number;
    spinnerWidth?: number;
    [key: string]: any
}


export const Button = ({
    kind,
    text,
    type,
    icon,
    round,
    disabled,
    size,           // this prop for icon button
    className,
    style,
    isLoading,
    spinnerTheme,
    spinnerSize,    // in rem
    spinnerWidth,   // in px
    ...rest
} : ButtonProps) => {
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
            { icon && <Icon name={ icon } size={ size || 22 }/> }
            { text && text }
            { isLoading && <Spinner {...spinnerProps}/> }
        </button>
    )
}
