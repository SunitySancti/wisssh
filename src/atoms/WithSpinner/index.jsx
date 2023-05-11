import React from 'react'

import './styles.scss'

export const WithSpinner = ({
    children,
    isLoading,
    size,
    colorTheme,
    strokeWidth,
    ...rest
}) => {
    // strokeWidth must be in range [1, 10]
    // colorTheme is one of list: 'primary', 'dark' or 'light'

    const sizeStyles = {
        width: `${size || 2}rem`,
        height: `${size || 2}rem`
    }

    const classes = (colorTheme || '') + (isLoading ? ' loading ' : '') + ' spinner';
    
    return (
        <div className='spinner-container' {...rest} >
            <div className={ 'children-container' + ( isLoading ? ' loading' : '' )}>
                { children }
            </div>
            { isLoading &&
                <svg
                    className={ 'spinner' + ( colorTheme ? ' ' + colorTheme : '' )}
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
            }
        </div>
    );
}