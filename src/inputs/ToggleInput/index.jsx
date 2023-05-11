import React from 'react'
import { Controller } from 'react-hook-form'

import './styles.scss'
import { SelectionMark } from 'atoms/Icon'

export const ToggleInput = ({ control, name, options }) => {

    const Option = ({ option, onChange, value }) => {
        const isChecked = option.value === value;

        return (
            <div
                className='toggle-button'
                onClick={() => onChange(option.value)}
            >
                <label>{ option.label }</label>
                { isChecked && <SelectionMark/> }
            </div>
        );
    }

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: {value, onChange} }) => (
                <div className='toggle-input'>

                    { options.map((option, index) => {
                        return (
                            <Option
                                key={index}
                                option={option}
                                value={value}
                                onChange={onChange}
                            />
                        );
                    })}

                </div>
            )}
        />
    );
}