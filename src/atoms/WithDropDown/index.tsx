import { useState,
         useEffect,
         useRef,
         forwardRef,
         useImperativeHandle } from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Portal } from 'containers/Portal'

import type { ReactNode,
              ForwardedRef,
              SetStateAction,
              SyntheticEvent } from 'react'
import type { IconName } from 'atoms/Icon'


interface OptionArgs {
    onClick: (e: SyntheticEvent) => void;
    icon?: IconName;
    text?: string;
    className?: string;
    dontHideAfterClick?: boolean;
    clickedIcon?: IconName;
    clickedText?: string;
    [prop: string]: any
}

interface OptionProps extends OptionArgs {
    setIsDropped: (value: SetStateAction<boolean>) => void;
}

interface WithDropDownProps {
    trigger: ReactNode;
    options: OptionArgs[];
    className: string;
    [prop: string]: any
}

export interface WithDropDownRef {
    closeDropDown(): void
}


const Option = ({
    icon,
    text,
    onClick,
    setIsDropped,
    className,
    dontHideAfterClick,
    clickedIcon,
    clickedText,
    ...rest
} : OptionProps
) => {
    const [clicked, setClicked] = useState(false);
    const handleClick = (e: SyntheticEvent) => {
        onClick(e);
        if(dontHideAfterClick) {
            setClicked(true)
        } else {
            setIsDropped(false)
        }
    }
    return (
        <div
            className={ 'dropdown-option ' + (clicked ? 'disabled ' : '') + (className ? className : '')}
            onClick={ handleClick }
            { ...rest }
        >
            { icon && 
                <Icon name={ clicked ? clickedIcon || icon : icon }/>
            }
            { text &&
                <span>{ clicked ? clickedText || text : text }</span>
            }
        </div>
    )
}

export const WithDropDown = forwardRef(({
    trigger,
    options,
    className,
    ...rest
} : WithDropDownProps,
    ref: ForwardedRef<WithDropDownRef>
) => {
    const [ isDropped, setIsDropped ] = useState(false);
    const [ coords, setCoords ] = useState({});
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const minPadding = 11;

    const openDropDown = (e: SyntheticEvent) => {
        e.stopPropagation();
        alignDropdown();
        setIsDropped(true)
    }

    const closeDropDown = (e: MouseEvent) => {
        if(dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement | null)) {
            setIsDropped(false)
        }
    }

    useImperativeHandle(ref, () => ({
        closeDropDown() { setIsDropped(false) }
    }));


    const alignDropdown = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if(!rect) return
        
        const dropToRight = (rect.left + rect.width / 2) < (window.innerWidth * 2 / 3);
        let left = null, right = null;

        if(dropToRight) {
            left = Math.max(rect.left, minPadding);
        } else {
            right = Math.max(window.innerWidth - rect.right, minPadding)
        }

        setCoords({ left, right, top: rect?.bottom })
    }

    useEffect(() => {
        window.addEventListener('resize', alignDropdown);
        document.addEventListener('mousedown', closeDropDown);
        return () => {
            window.removeEventListener('resize', alignDropdown);
            document.removeEventListener('mousedown', closeDropDown)
        }
    },[ dropdownRef.current ]);

    return <>
        <div
            ref={ triggerRef }
            className={ 'dropdown-trigger ' + (className || '')}
            children={ trigger }
            onClick={ openDropDown }
            {...rest}
        />
        { isDropped && 
            <Portal layer='dropdown'>
                <div
                    ref={ dropdownRef }
                    className='dropdown'
                    style={ coords }
                >
                    { options?.map( (option, index) => (
                        <Option
                            key={ index }
                            { ...option }
                            setIsDropped={ setIsDropped }
                        />
                    ))}
                </div>
            </Portal>
        }
    </>
})
