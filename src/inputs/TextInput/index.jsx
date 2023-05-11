import React, { useEffect } from 'react'

import './styles.scss'
import { generateId } from 'utils'
import { Icon } from 'atoms/Icon'
import { TextLabel } from 'atoms/TextLabel'

export const TextInput = ({
    register,
    name,
    label,
    labelWidth,
    type,
    multiline,
    required,
    maxLength,
    patternType,
    formState,
    warningMessage,
    onChange,
    ...rest
}) => {
    const id = generateId();
    const errorTypes = ({
       required: formState?.errors[name]?.type === 'required',
       maxLength: formState?.errors[name]?.type === 'maxLength',
       pattern: formState?.errors[name]?.type === 'pattern',
    });

    const errorMessage = errorTypes.required
        ? `"${label}" — обязательное поле`
        : errorTypes.maxLength
        ? `Введите не более ${maxLength} символов`
        : errorTypes.pattern && (patternType === 'number')
        ? `В поле "${label}" допустимы только цифры`
        : errorTypes.pattern && (patternType === 'email')
        ? 'Проверьте правильность написания почты'
        : null

    const shouldShowError = !!( warningMessage || errorMessage )

    const pattern = (patternType === 'number')
        ? /^[0-9]+$/
        : (patternType === 'email')
        ? /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        : null

    return (
        <div className='text-input'>
            { label && (
                <TextLabel
                    htmlFor={id}
                    text={label}
                    style={{ width: labelWidth }}
                    required={required}
                />
            )}
            { multiline
            ?   <>
                    <textarea
                        id={id}
                        {...register(name, {
                            required,
                            maxLength,
                            pattern,
                            onChange
                        })}
                        className={ shouldShowError ? 'error' : null }
                        {...rest}
                    />
                    <Icon name='resizer' size='22'/>
                </>
            :   <input
                    id={id}
                    type={type || 'text'}
                    {...register(name, {
                        required,
                        maxLength,
                        pattern,
                        onChange
                    })}
                    className={ shouldShowError ? 'error' : null }
                    {...rest}
                />
            }
            { shouldShowError &&
                <span className='error-message'>{ warningMessage || errorMessage }</span>
            }
        </div>
    );
}