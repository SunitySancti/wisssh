import './styles.scss'
import { generateId } from 'utils'
import { Icon } from 'atoms/Icon'
import { TextLabel } from 'atoms/TextLabel'

import type { ReactNode } from 'react'
import type { FieldValues,
              UseFormRegister,
              FormState,
              Path } from 'react-hook-form'
import type { BasicId } from 'typings'


interface TextInputProps<FV extends FieldValues> {
    name: string;
    label: string;
    register: UseFormRegister<FV>;
    onChange?: () => void;
    onBlur?: (e: KeyboardEvent & FocusEvent) => void;
    onKeyDown?: (e: KeyboardEvent & FocusEvent) => void;
    labelWidth?: number;    // in px
    type?: string;          // input 'type' field
    multiline?: boolean;
    required?: boolean;
    maxLength?: number;     // max length of input string
    patternType?: 'number' | 'email';
    formState?: FormState<FV>;
    warningMessage?: string;
    className?: string;
    rightAlignedComponent?: ReactNode;
    autoComplete?: string;
    [prop: string]: any
}


export const TextInput = <FV extends FieldValues>({
    name,
    label,
    register,
    onChange,
    onBlur,
    onKeyDown,
    labelWidth,
    type,
    multiline,
    required,
    maxLength,
    patternType,
    formState,
    warningMessage,
    className,
    rightAlignedComponent,
    autoComplete,
    ...rest
} : TextInputProps<FV>
) => {
    const id = generateId<BasicId>();
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
        : undefined

    return (
        <div className={className ? 'text-input ' + className : 'text-input'}>
            { label && (
                <TextLabel
                    htmlFor={id}
                    text={label}
                    style={ labelWidth ? { width: labelWidth } : null }
                    required={required}
                />
            )}
            { multiline
            ?   <>
                    <textarea
                        id={id}
                        {...register(name as Path<FV>, {
                            required,
                            maxLength,
                            pattern,
                            onChange,
                            onBlur
                        })}
                        className={ shouldShowError ? 'error' : undefined }
                        autoComplete={ autoComplete || name || 'off' }
                        {...rest}
                    />
                    <Icon name='resizer' size={ 22 }/>
                </>
            :   <input
                    id={id}
                    type={type || 'text'}
                    {...register(name as Path<FV>, {
                        required,
                        maxLength,
                        pattern,
                        onChange,
                        onBlur
                    })}
                    className={ shouldShowError ? 'error' : undefined }
                    autoComplete={ autoComplete || name || 'off' }
                    {...rest}
                />
            }
            { rightAlignedComponent &&
                <div className='right-aligned-component'>
                    { rightAlignedComponent }
                </div>
            }
            { shouldShowError &&
                <span className='error-message'>{ warningMessage || errorMessage }</span>
            }
        </div>
    );
}
