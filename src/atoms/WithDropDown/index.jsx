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
    options,
    className,
    ...rest
},  ref ) => {
    const [ isDropped, setIsDropped ] = useState(false);
    const [ coords, setCoords ] = useState({});
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const minPadding = 11;

    const openDropDown = e => {
        e.stopPropagation();
        alignDropdown();
        setIsDropped(true)
    }

    const closeDropDown = e => {
        if(dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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
            className={ className ? 'dropdown-trigger ' + className : 'dropdown-trigger' }
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
                            setIsDropped={ setIsDropped }
                            { ...option }
                        />
                    ))}
                </div>
            </Portal>
        }
    </>
})
