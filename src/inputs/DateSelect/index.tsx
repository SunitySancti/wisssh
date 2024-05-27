import { forwardRef } from 'react'
import   DatePicker from 'react-datepicker'
import { Controller } from 'react-hook-form'
import   ru from 'date-fns/locale/ru'
import 'react-datepicker/dist/react-datepicker.css'

import './styles.scss'
import { TextLabel } from 'atoms/TextLabel'
import { Button } from 'atoms/Button'

import { generateId,
         formatDateToArray } from 'utils'
import { useAppSelector } from 'store'


import type { ForwardedRef } from 'react'
import type { Control,
              Path,
              FieldValues } from 'react-hook-form'
import type { DateArray,
              BasicId } from 'typings'


interface DateSelectProps<FV extends FieldValues> {
    control: Control<FV>,
    name: string,
    label: string,
    labelWidth?: number, // in px
    required?: boolean
}

interface DateSelectControllerRenderProps {
    field: {
        value: DateArray;
        onChange: (newValue: DateArray) => void
    }
}

interface CustomInputProps {
    value?: string;
    onClick?: () => void
}

interface CustomHeaderProps {
    date: Date;
    decreaseMonth: () => void;
    increaseMonth: () => void;
    prevMonthButtonDisabled: boolean;
    nextMonthButtonDisabled: boolean
}


export const DateSelect = <FV extends FieldValues>({
    control,
    name,
    label,
    labelWidth,
    required
} : DateSelectProps<FV>
) => {
    const { isNarrow } = useAppSelector(state => state.responsiveness);
    const months = [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ];
    const buttonId = generateId<BasicId>();

    const CustomInput = forwardRef((
        { value, onClick }: CustomInputProps,
        ref: ForwardedRef<HTMLInputElement>
    ) => (
        <div className='text-input'>
            <input {...{
                onClick,
                ref,
                value,
                readOnly: true
            }}/>
            <Button {...{
                onClick,
                id: buttonId,
                icon: 'chevronDown',
                type: 'button'
            }}/>
        </div>
    ));

    const CustomHeader = ({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
    } : CustomHeaderProps
    ) => (
        <div className='custom-header'>
            <Button
                icon='arrowLeft'
                onClick={ decreaseMonth }
                disabled={ prevMonthButtonDisabled }
            />
            <span>
                { months.at(date.getMonth ()) }
            </span>
            <Button
                icon='arrowRight'
                onClick={ increaseMonth }
                disabled={ nextMonthButtonDisabled }
            />
        </div>
    );
    
    return (
        <div className={ 'date-select' + (isNarrow ? ' narrow' : '')}>
            <TextLabel
                htmlFor={ buttonId }
                text={ label }
                required={ required }
                style={ labelWidth ? { width: labelWidth } : null }
            />
            <Controller
                control={ control }
                name={ name as Path<FV> }
                render={({ field: { value, onChange }}: DateSelectControllerRenderProps ) => (
                    <DatePicker
                        selected={ new Date(value[2], value[1] - 1, value[0]) }
                        onChange={ (date: Date) => onChange(formatDateToArray(date)) }

                        closeOnScroll={ (e: Event) => e.target === document.querySelector('.work-space') }
                        customInput={ <CustomInput/> }
                        renderCustomHeader={ (props: CustomHeaderProps) => <CustomHeader {...props}/> }
                        calendarClassName='custom-calendar'
                        dateFormat="d MMMM yyyy"
                        fixedHeight
                        showPopperArrow={ false }
                        minDate={ new Date() }
                        locale={ ru }
                    />
                )}
            />
        </div>
    );
}
