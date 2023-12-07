import './styles.scss'
import { Icon } from 'atoms/Icon'

import type { BasicId } from 'typings'


interface TextLabelProps {
    text: string;
    htmlFor: BasicId;
    required?: boolean;
    optional?: boolean;
    [prop: string]: any
}


export const TextLabel = ({
    htmlFor,
    text,
    required,
    optional,
    ...rest
} : TextLabelProps
) => {
    return (
        <label
            htmlFor={ htmlFor }
            className='text-label'
            {...rest}
        >
            <span className='text'>{ text }</span>
            { required && !optional && <Icon name='star' size={ 22 }/> }
            { optional && !required && <span className='optional'>(optional)</span> }
        </label>
    );
}
