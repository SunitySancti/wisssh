import   Select,
       { components } from 'react-select'
import { Controller } from 'react-hook-form'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { TextLabel } from 'atoms/TextLabel'
import { generateId } from 'utils'

import { useAppSelector } from 'store'

import type { ReactNode } from 'react'
import type { StylesConfig,
              DropdownIndicatorProps,
              ClearIndicatorProps,
              MultiValueRemoveProps } from 'react-select'
import type { Control,
              FieldValues,
              Path } from 'react-hook-form'
import type { BasicId } from 'typings'


interface Option {
    label: string;
    value: unknown
}

interface SelectBoxProps<FV extends FieldValues> {
    control: Control<FV>;
    name: string;
    options: Option[];
    label: string;
    labelWidth?: number;
    isMulti?: boolean;
    placeholder?: string;
    required?: boolean;
    noOptionsMessage?: () => ReactNode
}


export const SelectBox = <FV extends FieldValues>({
    control,
    name,
    options,
    label,
    labelWidth,
    isMulti,
    placeholder,
    required,
    noOptionsMessage
} : SelectBoxProps<FV>
) => {
    // GETTING RESPONSIVE 
    const { isNarrow } = useAppSelector(state => state.responsiveness);

    const id = generateId<BasicId>();

    const customStyles: StylesConfig<Option> = {
        container: base => ({
            ...base,
            width: '100%',
            flex: '1 1',
            minWidth: '226px'
        }),
        control: (base, state) => ({
            ...base,
            borderRadius: '2rem',
            outline: 'none',
            overflow: 'hidden',
            borderColor: state.isFocused ? '#F3E672' : '#C5C5C5',  // primary : gray1
            boxShadow: state.isFocused ? 'inset 0px 0px 11px rgba(243, 230, 114, 0.3)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#F3E672' : '#777',  // primary : darkGray1
                '.icon.opener > svg' : {
                    fill: '#505050'  // darkGray2
                }

            }
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '4.5px',
            gap: '3px'
        }),
        input: (base) => ({
            ...base,
            marginLeft: '1.5rem',
            font: '400 16px/22px "Lato", sans-serif',
            color: '#505050'  // darkGray2

        }),
        placeholder: (base, state) => ({
            ...base,
            marginLeft: '1.5rem',
            font: '400 16px/22px "Lato", sans-serif',
            color: state.isFocused ? '#d4d4d4' : '#C5C5C5',  // lightGray3, gray1
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }),
        singleValue: (base) => ({
            ...base,
            marginLeft: '1.5rem',
            font: '400 16px/22px "Lato", sans-serif',
            color: '#505050'  // darkGray2

        }),
        multiValue: (base) => ({
            ...base,
            borderRadius: '2rem',
            padding: '0 0 0 1rem',
            overflow: 'hidden',
            margin: '0',
            backgroundColor: '#F8ED8F', // primary
            '> div:first-of-type': {
                font: '400 16px/22px "Lato", sans-serif',
                padding: '0.5rem'
            },
            '> div:last-of-type': {
                padding: '0',
                '&:hover': {
                    backgroundColor: '#F85669',  // negativeHover
                },
                '> div > svg:hover': {
                    fill: 'white',  // darkGray2
                },
            },
        }),
        indicatorsContainer: (base) => ({
            ...base,
            alignItems: 'end',
            'span': {
                display: 'none'
            },
            'div': {
                padding: '0',
                cursor: 'pointer',
                'svg': {
                    fill: '#999',  // gray2
                    '&:hover': {
                        fill: '#505050',
                },
            }
            }
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '2rem',
            padding: '0',
            overflow: 'hidden'
        }),
        menuList: (base) => ({
            ...base,
            padding: '0',
            border: 'none'
        }),
        option: (base, state) => ({
            ...base,
            padding: '1rem 2rem',
            font: '400 16px/22px "Lato", sans-serif',
            color: '#505050',  // darkGray2
            display: 'flex',
            alignItems: 'center',
            backgroundColor: state.isSelected ? '#FBF8DD' : 'white', // primaryLight
            '&:hover': {
                backgroundColor: '#F3E672', // primary
                cursor: 'pointer'
            }
        }),
        noOptionsMessage: (base) => ({
            ...base,
            font: '400 16px/22px "Lato", sans-serif',
            color: '#d4d4d4',  // gray1
        }),
    }

    const DropdownIndicator = (props: DropdownIndicatorProps<Option, boolean>) => {
        return (
          <components.DropdownIndicator {...props}>
            <Icon name='chevronDown' size={ 42 } className='opener'/>
          </components.DropdownIndicator>
        );
    };

    const ClearIndicator = (props: ClearIndicatorProps<Option, true>) => {
        return (
          <components.ClearIndicator {...props}>
            <Icon name='clear' size={ 42 }/>
          </components.ClearIndicator>
        );
    };

    const MultiValueRemove = (props: MultiValueRemoveProps<Option, true>) => {
        return (
            <components.MultiValueRemove {...props}>
                <Icon name='closeMini' size={ 33 }/>
            </components.MultiValueRemove>
        );
    };

    return (
        <div
            className={ 'select-box' + (isMulti ? ' multi' : '' ) + (isNarrow ? ' narrow' : '')}
        >
            { label &&  <TextLabel
                            htmlFor={ id }
                            text={label}
                            style={labelWidth ? { width: labelWidth } : null}
                            required={required}
                        />
            }
            <Controller
                name={ name as Path<FV> }
                control={ control }
                render={({ field }) => ( isMulti
                    ?   <Select<Option, true>
                            {...field}

                            options={ options }
                            isMulti
                            placeholder={ placeholder }

                            value={ options?.filter(option => field.value?.includes(option.value)) }
                            onChange={ (options: readonly Option[]) => field.onChange(options.map(option => option.value)) }

                            components={{ DropdownIndicator, ClearIndicator, MultiValueRemove }}
                            styles={ customStyles }
                            id={ id }
                            noOptionsMessage={ noOptionsMessage }
                        />
                    :   <Select<Option, false>
                            {...field}

                            value={ options?.find(option => option.value === field.value) }
                            onChange={ (option: Option | null) => field.onChange(option?.value) }

                            options={ options }
                            isMulti={ false }
                            placeholder={ placeholder }
                            styles={ customStyles }
                            id={ id }
                            components={{ DropdownIndicator }}
                            noOptionsMessage={ noOptionsMessage }
                        />
                    )
                }
            />
        </div>
    )
}
