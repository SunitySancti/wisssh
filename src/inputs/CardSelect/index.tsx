import { Controller } from 'react-hook-form'

import './styles.scss'
import { Button } from 'atoms/Button'
import { Plug } from 'atoms/Plug'
import { WishCard } from 'molecules/WishCard'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { LineContainer } from 'containers/LineContainer'

import type { Control,
              FieldValues,
              Path } from 'react-hook-form'
import type { Wish,
              WishId } from 'typings'
 

interface CardSelectProps<FV extends FieldValues> {
    control: Control<FV>,
    name: string,
    options: Wish[]
}

interface CardSelectControllerRenderProps {
    field: {
        value: WishId[];
        onChange: (newValue: WishId[]) => void
    }
}


export const CardSelect = <FV extends FieldValues>({
    control,
    name,
    options
} : CardSelectProps<FV>
) => {
    return ( options && options?.length
        ?   <Controller
                control={control}
                name={name as Path<FV>}
                render={({ field: { value, onChange }}: CardSelectControllerRenderProps) => (
                    <div className='card-select'>
                        <LineContainer>
                            <span
                                children={
                                    value?.length
                                    ? `Выбрано желаний: ${value?.length}`                           
                                    : 'Кликните на карточку, чтобы добавить желание в вишлист'
                                }
                            />
                            <div style={{flex: 1}}/>
                            <Button
                                icon='clear'
                                onClick={(e: MouseEvent) => {
                                    e.preventDefault();
                                    onChange([]);
                                }}
                            />
                            <Button
                                text='Выделить все'
                                onClick={(e: MouseEvent) => {
                                    e.preventDefault();
                                    onChange(options.map(option => option.id!));
                                }}
                                round
                                disabled={value?.length === options?.length}
                            />
                        </LineContainer>
                        <MultiColumnLayout
                            Card={WishCard}
                            data={options}
                            value={value}
                            onChange={onChange}
                        />
                    </div>
                )}
            />
        :   <Plug position='newListNoWishes'/>
    );
}
