import React,{ useState } from 'react'

import './styles.scss'
import { TextInput } from 'inputs/TextInput'
import { Icon } from 'atoms/Icon'

export const PasswordInput = (props) => {
    const [passwordInputType, setPasswordInputType] = useState('password');

    return (
        <div className='password-input'>
            <TextInput
                name='password'
                type={ passwordInputType }
                label='Password'
                {...props}
            />
            <Icon
                name='lookPass'
                onMouseOver={ () => setPasswordInputType('text') }
                onMouseOut={ () => setPasswordInputType('password') }
            />
        </div>
    )
}