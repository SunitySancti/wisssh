import React,{ useState } from 'react'

import './styles.scss'
import { TextInput } from 'inputs/TextInput'
import { Icon } from 'atoms/Icon'

export const PasswordInput = ({ className, name, autoComplete, label, ...rest }) => {
    const [passwordInputType, setPasswordInputType] = useState('password');

    return (
        <div className={'password-input ' + className}>
            <TextInput
                name={name || 'password'}
                type={ passwordInputType }
                label={label || 'Password'}
                autoComplete={autoComplete || name || "password"}
                {...rest}
            />
            <Icon
                name='lookPass'
                onMouseOver={ () => setPasswordInputType('text') }
                onMouseOut={ () => setPasswordInputType('password') }
            />
        </div>
    )
}