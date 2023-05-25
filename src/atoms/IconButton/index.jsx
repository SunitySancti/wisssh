import React from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'

export const IconButton = ({ icon, size, type, style, className, ...rest }) => {
    const styles = {
        width: `${size || 4}rem`,
        height: `${size || 4}rem`,
        ...style
    }
    return (
        <button
            className={className ? 'icon-button ' + className : 'icon-button'}
            style={ styles }
            type={ type || 'button' }
            {...rest}
        >
            <Icon
                name={ icon }
                size={ size && size }
            />
        </button>
    );
}