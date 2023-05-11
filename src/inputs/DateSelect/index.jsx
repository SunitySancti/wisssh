import React, { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Controller } from 'react-hook-form'
import ru from 'date-fns/locale/ru'

import './styles.scss'
import { TextLabel } from 'atoms/TextLabel'
import { IconButton } from 'atoms/IconButton'
import { formatDateToArray } from 'utils'

export const DateSelect = ({
    control,
    name,
    label,
    labelWidth,
    required,
    ...rest
}) => {
    const months = [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ];
    const CustomInput = forwardRef(({ value, onClick }, ref) => {
        return (
        <div className='text-input'>
            <input
                onClick={onClick}
                ref={ref}
                value={value}
                readOnly
            />
            <IconButton
                icon='chevronDown'
                onClick={onClick}
                type='button'
            />
        </div>
    )});
    const CustomHeader = ({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
    }) => {
        return (
            <div className='custom-header'>
                <IconButton
                    icon='arrowLeft'
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                />
                <span>
                    {months.at(date.getMonth())}
                </span>
                <IconButton
                    icon='arrowRight'
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                />
            </div>
        );
    }
    
    return (
        <div className='date-select'>
            <TextLabel
                text={label}
                required={required}
                style={labelWidth ? { width: labelWidth } : null}
            />
            <Controller
                control={control}
                name={name}
                render={({ field: { value, onChange } }) => {
                    return (
                        <DatePicker
                            // {...rest} 
                            selected={new Date([value[2], value[1], value[0]])}
                            onChange={date => onChange(formatDateToArray(date))}

                            closeOnScroll={(e) => e.target === document.querySelector('.work-space')}
                            customInput={<CustomInput />}
                            renderCustomHeader={props => <CustomHeader {...props}/>}
                            calendarClassName='custom-calendar'
                            dateFormat="d MMMM yyyy"
                            fixedHeight
                            showPopperArrow={false}
                            minDate={new Date()}
                            locale={ru}
                            // openToDate={new Date("1993/09/28")}
                        />
                    );
                }}
            />
            
        </div>
    );
}