import { useState } from 'react'

import './styles.scss'
import { TextInput } from 'inputs/TextInput'
import { Icon } from 'atoms/Icon'

import type { FieldValues,
              UseFormRegister } from 'react-hook-form'


interface PasswordInputProps<FV extends FieldValues> {
    register: UseFormRegister<FV>;
    name: string;
    label?: string;
    className?: string;
    autoComplete?: string;
    labelWidth?: number;
    warningMessage?: string;
    required?: boolean;
    disabled?: boolean
}

interface PasswordInputViewProps<FV extends FieldValues> extends PasswordInputProps<FV> {
    setType(type: 'password' | 'text'): void
    type: 'password' | 'text';
}


const PasswordInputView = <FV extends FieldValues>({
    register,
    setType,
    type,
    name,
    label,
    className,
    autoComplete,
    labelWidth,
    warningMessage,
    required,
    disabled,
} : PasswordInputViewProps<FV>
) => (
    <div className={ 'password-input ' + (className || '') }>
        <TextInput {...{
            name: name || 'password',
            label: label || 'Password',
            autoComplete: autoComplete || name || "password",
            register,
            type,
            labelWidth,
            warningMessage,
            required,
            disabled
        }}
        />
        <Icon
            name='lookPass'
            onMouseOver={ () => setType('text') }
            onMouseOut={ () => setType('password') }
        />
    </div>
);

export const PasswordInput = <FV extends FieldValues>(
    props : PasswordInputProps<FV>
) => {
    const [type, setType] = useState<'password' | 'text'>('password');
    return <PasswordInputView {...{ ...props, type, setType }}/>
}
