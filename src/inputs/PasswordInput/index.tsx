import { useState } from 'react'

import './styles.scss'
import { TextInput } from 'inputs/TextInput'
import { Icon } from 'atoms/Icon'

import type { FieldValues,
              UseFormRegister } from 'react-hook-form'


interface PasswordInputProps<FV extends FieldValues> {
    name: string;
    label: string;
    register: UseFormRegister<FV>;
    className?: string;
    autoComplete?: string;
    [prop: string]: any
}


export const PasswordInput = <FV extends FieldValues>({
    name,
    label,
    register,
    className,
    autoComplete,
    ...rest
} : PasswordInputProps<FV>
) => {
    const [passwordInputType, setPasswordInputType] = useState('password');

    return (
        <div className={ 'password-input ' + (className || '') }>
            <TextInput
                name={ name || 'password' }
                label={ label || 'Password' }
                type={ passwordInputType }
                register={ register }
                autoComplete={ autoComplete || name || "password" }
                { ...rest }
            />
            <Icon
                name='lookPass'
                onMouseOver={ () => setPasswordInputType('text') }
                onMouseOut={ () => setPasswordInputType('password') }
            />
        </div>
    )
}
