import React from 'react'

import './styles.scss'


export const Spinner = ({   // Spinner wants parent container to be positioned (non static)
    size,                   // in rem
    colorTheme,             // 'primary' || 'dark' || 'light'
    strokeWidth             // in px, better in range [1, 10]
}) => {                     // Wether to show spinner or not is the responsibility of parent
    const sizeStyles = {
        width: `${size || 2}rem`,
        height: `${size || 2}rem`
    }
    
    return (
        <svg
            className={'spinner' + ( colorTheme ? ' ' + colorTheme : ' primary')}
            style={ sizeStyles }
            viewBox='0 0 100 100'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
        >
            <circle
                cx='50' cy='50' r='45'
                strokeWidth={ strokeWidth || 7 }
            />
        </svg>
    );
}

export const WithSpinner = ({
    children,
    isLoading,      // Boolean
    size,           // in rem
    colorTheme,     // 'primary' || 'dark' || 'light'
    strokeWidth,    // in px, better in range [1, 10]
    className,
    ...rest
}) => {
    const spinnerProps = ({ size, colorTheme, strokeWidth });
    
    return (
        <div
            className={ className ? 'spinner-container ' + className : 'spinner-container' }
            {...rest}
        >
            <div className={ 'children-container' + ( isLoading ? ' loading' : '' )}>
                { children }
            </div>
            { isLoading && <Spinner {...spinnerProps}/> }
        </div>
    );
}