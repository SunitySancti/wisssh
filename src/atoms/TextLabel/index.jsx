import React from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'

export const TextLabel = ({ htmlFor, text, required, ...rest }) => {
    return (
        <label
            htmlFor={ htmlFor }
            className='text-label'
            {...rest}
        >
            <span>{ text }</span>
            { required
            ?   <Icon
                    name='star'
                    size='22'
                />
            :   <span>(optional)</span>
            }
        </label>
    );
}