import   React,
       { useState } from 'react'
import { Controller } from 'react-hook-form'

import './styles.scss'


export const CheckBox = ({
    control,
    callback,
    name,
    label,
    className
}) => {
    const [checked, setChecked] = useState(false);
    const onChange = (value) => {
        setChecked(value);
        callback(value)
    }

    const Component = ({ value, onChange }) => {
        const handleKeyDown = (e) => {
            if(e.keyCode === 13) onChange(!value)
        }
        return (
            <div
                className={className ? 'checkbox ' + className : 'checkbox'}
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
                render={({ field: { value, onChange }}) => (
                    <Component value={value} onChange={onChange}/>
                )}
            />
        :   <Component value={checked} onChange={onChange}/>
    )
}
