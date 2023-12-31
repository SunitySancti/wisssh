import { useState } from 'react'
import { Controller } from 'react-hook-form'

import './styles.scss'

import type { Control } from 'react-hook-form'
import type { KeyboardEvent } from 'react'


interface CheckBoxProps {
    control?: Control;
    name?: string;
    callback?: (value: boolean) => void;
    label: string;
    className?: string
}

interface CheckboxControllerFieldProps {
    value: boolean;
    onChange: (newValue: boolean) => void
}

interface CheckboxControllerRenderProps {
    field: CheckboxControllerFieldProps
}

interface CheckBoxViewProps extends CheckboxControllerFieldProps {
    label: string;
    className?: string
}


const CheckBoxView = ({
    value,
    onChange,
    label,
    className
} : CheckBoxViewProps
) => (
    <div
        className={ 'checkbox ' + (className || '') }
        onClick={ () => onChange(!value) }
        tabIndex={ 0 }
        onKeyDown={ (e: KeyboardEvent) => {
            if(e.key === 'Enter') onChange(!value)
        }}
    >
        <div className={ value ? 'box checked' : 'box' }/>
        <span className='label'>{ label }</span>
    </div>
);

export const CheckBox = ({
    control,
    name,
    callback,
    label,
    className
} : CheckBoxProps
) => {
    const [checked, setChecked] = useState(false);
    const onChangeWithCallback = (value: boolean) => {
        setChecked(value);
        callback && callback(value)
    }

    return ((control && name)
        ?   <Controller
                name={name}
                control={control}
                render={({ field: { value, onChange }}: CheckboxControllerRenderProps) => (
                    <CheckBoxView {...{ value, onChange, label, className }}/>
                )}
            />
        :   callback
        ?   <CheckBoxView {...{
                value: checked,
                onChange: onChangeWithCallback,
                label,
                className
            }}/>
        :   null
    )
}
