import React from 'react'
import { Controller } from 'react-hook-form'

import './styles.scss'
import { EmptyStar, FilledStar } from 'atoms/Icon'

export const StarRating = ({ control, name, maxStars, starBoxSize, readOnly, rating }) => {
    
    const Star = ({ orderIndex, value, onChange }) => {
        const size = starBoxSize ? starBoxSize + 'rem' : '2rem';
        const isFilled = orderIndex <= value;

        const handleClick = () => {
            if(readOnly) return;
            if(orderIndex === value) onChange(0);
            else onChange(orderIndex);
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

    const result = readOnly
        ? (
            <div className='star-rating read-only'>
                {[...Array(rating)].map((item, index) => {
                    return (
                        <Star
                            key={index}
                            orderIndex={index + 1}
                            value={rating}
                        />
                    );
                })}
            </div>
          )
        : (
            <Controller
                name={name}
                control={control}
                render={({ field: { value, onChange }}) => (
                    <div className='star-rating editable'>
    
                        {[...Array(maxStars)].map((item, index) => {
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
          );

    return result
}