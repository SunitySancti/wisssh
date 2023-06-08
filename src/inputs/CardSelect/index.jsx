import React from 'react'
import { Controller } from 'react-hook-form'

import './styles.scss'
import { Button } from 'atoms/Button'
import { WishCard } from 'molecules/WishCard'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { LineContainer } from 'containers/LineContainer'


export const CardSelect = ({ control, name, options }) => {
    const spacer = <div style={{flex: 1}}/>
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange }}) => (
                // value: [...wishIds]
                <div className='card-select'>
                    <LineContainer>
                        <span
                            children={
                                value?.length
                                ? `Выбрано желаний: ${value?.length}`                           
                                : 'Кликните на карточку, чтобы добавить желание в вишлист'
                            }
                        />
                        { spacer }
                        <Button
                            icon='clear'
                            onClick={(e) => {
                                e.preventDefault();
                                onChange([]);
                            }}
                        />
                        <Button
                            text='Выделить все'
                            onClick={(e) => {
                                e.preventDefault();
                                onChange(options.map(option => option.id));
                            }}
                            round
                            disabled={value?.length === options?.length}
                        />
                    </LineContainer>
                    <MultiColumnLayout
                        Card={WishCard}
                        data={options}
                        isInput
                        value={value}
                        onChange={onChange}
                    />
                </div>
            )}
        />
    );
}