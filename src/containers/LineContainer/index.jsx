import React from 'react'

import './styles.scss'

export const LineContainer = ({ className, ...rest }) => {
    const classes = className ? ` ${className}` : null
    return (
        <div
            className={ className
                ? 'line-container ' + className
                : 'line-container'
            }
            {...rest}
        />
    );
}
