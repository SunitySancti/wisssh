import { useState } from 'react'

import './styles.scss'
import { TextInput } from 'inputs/TextInput'
import { Icon } from 'atoms/Icon'

import type { FieldValues,
              UseFormRegister } from 'react-hook-form'
import { useAppSelector } from 'store'


interface PasswordInputProps<FV extends FieldValues> {
    register: UseFormRegister<FV>;
    name: string;
    label?: string;
    className?: string;
    autoComplete?: string;
    labelWidth?: number;
    warningMessage?: string;
    required?: boolean;
    disabled?: boolean;
}

interface PasswordInputViewProps<FV extends FieldValues> extends PasswordInputProps<FV> {
    setIsPasswordVisible(b: boolean): void;
    isPasswordVisible: boolean;
    isMobile: boolean;
}


const PasswordInputView = <FV extends FieldValues>({
    register,
    setIsPasswordVisible,
    isPasswordVisible,
    name,
    label,
    className,
    autoComplete,
    labelWidth,
    warningMessage,
    required,
    disabled,
    isMobile
} : PasswordInputViewProps<FV>
) => (
    <div className={ 'password-input ' + (className || '') }>
        <TextInput {...{
            name: name || 'password',
            label: label || 'Password',
            autoComplete: autoComplete || name || "password",
            register,
            type: isPasswordVisible ? 'text' : 'password',
            labelWidth,
            warningMessage,
            required,
            disabled
        }}
        />
        <Icon
            name='lookPass'
            onClick={ isMobile ? () => setIsPasswordVisible(!isPasswordVisible) : undefined }
            onMouseOver={ isMobile ? undefined : () => setIsPasswordVisible(true) }
            onMouseOut={ isMobile ? undefined : () => setIsPasswordVisible(false) }
        />
    </div>
);

export const PasswordInput = <FV extends FieldValues>(
    props : PasswordInputProps<FV>
) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isMobile = useAppSelector(state => state.responsiveness.isMobile);

    return <PasswordInputView {...{ ...props, isPasswordVisible, setIsPasswordVisible, isMobile }}/>
}
