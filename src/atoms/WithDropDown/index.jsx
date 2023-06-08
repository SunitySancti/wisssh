import   React,
       { useState,
         useEffect,
         useRef,
         forwardRef,
         useImperativeHandle } from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Portal } from 'containers/Portal'


const Option = ({
    icon,
    text,
    onClick,
    className,
    setIsDropped,
    dontHideAfterClick,
    clickedIcon,
    clickedText,
    ...rest
}) => {
    const [clicked, setClicked] = useState(false);

    return (
        <div
            className={ 'dropdown-option ' + (clicked ? 'disabled ' : '') + (className ? className : '')}
            onClick={(e) => {
                onClick(e);
                if(dontHideAfterClick) {
                    setClicked(true)
                } else {
                    setIsDropped(false)
                }
            }}
            { ...rest }
        >
            { icon && 
                <Icon name={ clicked ? clickedIcon : icon }/>
            }
            { text &&
                <span>{ clicked ? clickedText : text }</span>
            }
        </div>
    )
}

export const WithDropDown = forwardRef(({
    trigger,
    options
},  ref ) => {
    const [ isDropped, setIsDropped ] = useState(false);
    const [ dropToRight, setDropToRight ] = useState(true);
    const [ coords, setCoords ] = useState({});
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const minPadding = 11;

    const openDropDown = e => {
        e.stopPropagation();
        alignDropdown();
        setIsDropped(true)
    }

    useImperativeHandle(ref, () => ({
        closeDropDown() { setIsDropped(false) }
    }));

    const closeDropDown = e => {
        if(dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsDropped(false)
        }
    }


    const alignDropdown = () => {
        const rect = triggerRef.current?.getBoundingClientRect();

        let left = dropToRight ? rect?.left || null : null;
        let right = dropToRight ? null : window.innerWidth - rect?.right || null;

        if(left && left < minPadding) {
            left = minPadding
        }
        if(right && right < minPadding) {
            right = minPadding
        }

        setCoords({ left, right, top: rect.bottom })
    }
    const setDirection = () => {
        const triggerRect = triggerRef.current?.getBoundingClientRect();
        const triggerMid = triggerRect.left + triggerRect.width / 2;
        const windowMid = window.innerWidth / 2;
        setDropToRight(triggerMid < windowMid)
    }

    useEffect(() => {
        setDirection();
        window.addEventListener('resize', alignDropdown);
        document.addEventListener('mousedown', closeDropDown);
        return () => {
            window.removeEventListener('resize', alignDropdown);
            document.removeEventListener('mousedown', closeDropDown)
        }
    },[ dropdownRef.current ]);


    return (
        <>
            <div
                ref={ triggerRef }
                className='dropdown-trigger'
                children={ trigger }
                onClick={ openDropDown }
            />
            { isDropped && (
                <Portal layer='dropdown'>
                    <div
                        ref={ dropdownRef }
                        className='dropdown'
                        style={ coords }
                    >
                        { options?.map( (option, index) => (
                            <Option
                                key={ index }
                                setIsDropped={ setIsDropped }
                                { ...option }
                            />
                        ))}
                    </div>
                </Portal>
            )}
        </>
    );
})
