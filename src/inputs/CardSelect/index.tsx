import { Controller } from 'react-hook-form'

import './styles.scss'
import { Button } from 'atoms/Button'
import { Plug } from 'atoms/Plug'
import { MultiColumnLayout } from 'containers/MultiColumnLayout'
import { LineContainer } from 'containers/LineContainer'

import { useAppSelector } from 'store'

import type { MouseEvent } from 'react'
import type { Control,
              FieldValues,
              Path } from 'react-hook-form'
import type { WishId } from 'typings'
 

interface CardSelectProps<FV extends FieldValues> {
    control: Control<FV>,
    name: string,
    options: WishId[]
}

interface CardSelectControllerRenderProps {
    field: {
        value: WishId[];
        onChange: (newValue: WishId[]) => void
    }
}

interface CardSelectViewProps {
    options: WishId[];
    value: WishId[];
    onChange: (newValue: WishId[]) => void;
    isMobile: boolean
}


const CardSelectView = ({
    options,
    value,
    onChange,
    isMobile
} : CardSelectViewProps
) => {
    return (
        <div className='card-select'>
            <LineContainer>
                <span
                    children={
                        value?.length
                        ? `Выбрано желаний: ${value?.length}`                           
                        : isMobile
                        ? 'Прикрепите желания'
                        : 'Кликните на карточку, чтобы добавить желание в вишлист'
                    }
                />
                { !isMobile && <div style={{flex: 1}}/> }
                <div className='button-group'>
                    <div>
                        <Button
                            icon='clear'
                            text='Очистить'
                            kind='clear'
                            onClick={(e: MouseEvent) => {
                                e.preventDefault();
                                onChange([]);
                            }}
                        />
                    </div>
                    <div>
                        <Button
                            text='Выбрать все'
                            onClick={(e: MouseEvent) => {
                                e.preventDefault();
                                onChange(options);
                            }}
                            kind={ isMobile ? 'primary' : 'secondary' }
                            round
                            disabled={value?.length === options?.length}
                        />
                    </div>
                </div>
            </LineContainer>
            <MultiColumnLayout {...{
                ids: options,
                value,
                onChange
            }}/>
        </div>
    )
};

export const CardSelect = <FV extends FieldValues>({
    control,
    name,
    options
} : CardSelectProps<FV>
) => {
    const isMobile = useAppSelector(state => state.responsiveness.isMobile);
    return ( options && options?.length
        ?   <Controller
                control={ control }
                name={ name as Path<FV> }
                render={({ field: { value, onChange }}: CardSelectControllerRenderProps) => (
                    <CardSelectView {...{ options, value, onChange, isMobile }}/>
                )}
            />
        :   <Plug position='newListNoWishes'/>
    );
}
