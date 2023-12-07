import { Controller } from 'react-hook-form'

import './styles.scss'
import { EmptyStar, FilledStar } from 'atoms/Icon'

import type { Control,
              FieldValues,
              Path } from 'react-hook-form'


interface StarRatingProps<FV extends FieldValues> {
    rating: number          // actual number of stars
    name?: string;          // input name
    maxStars?: number;      // maximal number of stars
    control?: Control<FV>;
    readOnly?: boolean;
    starBoxSize?: number;   // size of star-box in rem
}

interface StarProps {
    orderIndex: number,
    value: number,
    onChange?: (newValue: number) => void
}


export const StarRating = <FV extends FieldValues>({
    control,
    name,
    maxStars = 5,
    starBoxSize,
    readOnly,
    rating
} : StarRatingProps<FV>
) => {
    
    const Star = ({
        orderIndex,
        value,
        onChange
    } : StarProps
    ) => {
        const size = starBoxSize ? starBoxSize + 'rem' : '2rem';
        const isFilled = orderIndex <= value;

        const handleClick = () => {
            if(readOnly || !onChange) return;
            if(orderIndex === value) {
                onChange(0)
            } else {
                onChange(orderIndex)
            }
        }
    
        return (
            <div
                className='star'
                onClick={ handleClick }
                style={{ width: size, height: size }}
            >
                { isFilled ? <FilledStar/> : <EmptyStar/> }
            </div>
        );
    }

    return (readOnly || !name)
        ?   <div className='star-rating read-only'>
                {[...Array(rating) as never[]].map((_item, index) => (
                        <Star
                            key={index}
                            orderIndex={index + 1}
                            value={rating}
                        />
                    )
                )}
            </div>
        :   <Controller
                name={ name as Path<FV> }
                control={ control }
                render={({ field: { value, onChange }}) => (
                    <div className='star-rating editable'>
    
                        {[...Array(maxStars)].map((_item, index) => {
                            return (
                                <Star
                                    key={index}
                                    orderIndex={index + 1}
                                    value={value}
                                    onChange={onChange}
                                />
                            );
                        })}
                        
                    </div>
                )}
            />
}
