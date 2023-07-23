import   React,
       { useMemo } from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Spinner } from 'atoms/Preloaders'


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
            { icon && <Icon name={ icon } size={ size ? size : '22' }/> }
            { text && text }
            { isLoading && <Spinner {...spinnerProps}/> }
        </button>
    )
}
