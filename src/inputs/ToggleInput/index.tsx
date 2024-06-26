import { Controller } from 'react-hook-form'

import './styles.scss'
import { SelectionMark } from 'atoms/Icon'

import type { Control,
              FieldValues,
              Path } from 'react-hook-form'


interface ToggleInputOption {
    value: string;
    label: string
}

interface ToggleInputProps<FV extends FieldValues> {
    control: Control<FV>,
    name: string,
    options: ToggleInputOption[]
}

interface ToggleInputControllerFieldProps {
    value: string;
    onChange: (newValue: string) => void
}

interface OptionComponentProps extends ToggleInputControllerFieldProps {
    option: ToggleInputOption
}

interface ToggleInputControllerRenderProps {
    field: ToggleInputControllerFieldProps
}


const Option = ({ option, value, onChange }: OptionComponentProps) => (
    <div
        className='toggle-button'
        onClick={() => onChange(option.value)}
    >
        <label>{ option.label }</label>
        { (option.value === value) && <SelectionMark/> }
    </div>
);

export const ToggleInput = <FV extends FieldValues>({
    control,
    name,
    options
} : ToggleInputProps<FV>
) => (
    <Controller
        name={ name as Path<FV> }
        control={ control }
        render={({ field:{ value, onChange }}: ToggleInputControllerRenderProps) => (
            <div className='toggle-input'>

                { options.map((option, index) => (
                        <Option
                            key={ index }
                            {...{ option, value, onChange }}
                        />
                ))}

            </div>
        )}
    />
)
