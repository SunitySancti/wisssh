import React from 'react'
import { Controller } from 'react-hook-form'

import './styles.scss'
import { generateId } from 'utils'


export const CheckBox = ({
    control,
    name,
    label,
    className
}) => {
    const id = generateId();
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { value, onChange }}) => {
                const handleKeyDown = (e) => {
                    if(e.keyCode === 13) onChange(!value)
                }
                return(
                    <div
                        className={className ? 'checkbox ' + className : 'checkbox'}
                        onClick={() => onChange(!value)}
                        tabIndex={0}
                        onKeyDown={handleKeyDown}
                    >
                        <div className={ value ? 'box checked' : 'box' }/>
                        <span className='label'>{ label }</span>
                    </div>
            )}}
        />
    )
}
