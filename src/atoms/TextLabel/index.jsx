import React from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'

export const TextLabel = ({ htmlFor, text, required, optional, ...rest }) => {
    return (
        <label
            htmlFor={ htmlFor }
            className='text-label'
            {...rest}
        >
            <span className='text'>{ text }</span>
            { required && !optional && <Icon name='star' size='22'/> }
            { optional && !required && <span className='optional'>(optional)</span> }
        </label>
    );
}