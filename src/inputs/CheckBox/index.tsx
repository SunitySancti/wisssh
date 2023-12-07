import { useState } from 'react'
import { Controller } from 'react-hook-form'

import './styles.scss'

import type { Control } from 'react-hook-form'
import type { KeyboardEvent } from 'react'


interface CheckBoxProps {
    name: string,
    label: string,
    className?: string
    control?: Control,
    callback?: (value: boolean) => void,
}

interface CheckboxControllerFieldProps {
    value: boolean;
    onChange: (newValue: boolean) => void
}

interface CheckboxControllerRenderProps {
    field: CheckboxControllerFieldProps
}


export const CheckBox = ({
    control,
    callback,
    name,
    label,
    className
} : CheckBoxProps
) => {
    const [checked, setChecked] = useState(false);
    const onChangeWithCallback = (value: boolean) => {
        setChecked(value);
        callback && callback(value)
    }

    const Component = ({ value, onChange }: CheckboxControllerFieldProps) => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(e.key === 'Enter') onChange(!value)
        }
        return (
            <div
                className={ 'checkbox ' + (className || '') }
                onClick={() => onChange(!value)}
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                <div className={ value ? 'box checked' : 'box' }/>
                <span className='label'>{ label }</span>
            </div>
        )
    }

    return ( control
        ?   <Controller
                name={name}
                control={control}
                render={({ field: { value, onChange }}: CheckboxControllerRenderProps) => (
                    <Component value={value} onChange={onChange}/>
                )}
            />
        :   callback
        ?   <Component value={checked} onChange={onChangeWithCallback}/>
        :   null
    )
}
