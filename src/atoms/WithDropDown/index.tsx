import { useState,
         useEffect,
         memo,
         useRef,
         forwardRef,
         useImperativeHandle, 
         useCallback} from 'react'

import './styles.scss'
import { Icon } from 'atoms/Icon'
import { Portal } from 'containers/Portal'

import type { ReactNode,
              ForwardedRef,
              SyntheticEvent,
              RefObject } from 'react'
import type { IconName } from 'atoms/Icon'
import type { WidthAwared } from 'typings'


interface OptionBaseProps {
    onClick: (e: SyntheticEvent) => void;
    icon: IconName;
    text: string;
    clickedIcon?: IconName;
    clickedText?: string
}

export interface DropdownOption extends OptionBaseProps {
    dontHideAfterClick?: boolean;
}

interface OptionProps extends DropdownOption {
    setIsDropped: (value: boolean) => void;
}

interface OptionViewProps extends OptionBaseProps {
    clicked: boolean
}

interface WithDropDownProps {
    trigger: ReactNode;
    options: DropdownOption[];
    className?: string
}

interface WithDropDownViewProps extends WithDropDownProps {
    triggerRef: RefObject<HTMLDivElement>;
    dropdownRef: RefObject<HTMLDivElement>;
    openDropDown(e: SyntheticEvent): void;
    isDropped: boolean;
    setIsDropped(value: boolean): void;
    left: number | undefined;
    right: number | undefined;
    top: number | undefined
}

export type WithDropDownRef = WidthAwared & {
    closeDropDown(): void
}

const OptionView = memo(({
    icon,
    text,
    clickedIcon,
    clickedText,
    onClick,
    clicked
} : OptionViewProps
) => (
    <div
        className={ 'dropdown-option ' + (clicked ? 'disabled ' : '') }
        onClick={ onClick }
    >
        { icon && 
            <Icon name={ clicked ? clickedIcon || icon : icon }/>
        }
        { text &&
            <span>{ clicked ? clickedText || text : text }</span>
        }
    </div>
));

const Option = ({
    onClick,
    setIsDropped,
    dontHideAfterClick,
    ...baseProps
} : OptionProps
) => {
    const [ clicked, setClicked ] = useState(false);
    const handleClick = useCallback((e: SyntheticEvent) => {
        onClick(e);
        if(dontHideAfterClick) {
            setClicked(true)
        } else {
            setIsDropped(false)
        }
    },[ dontHideAfterClick,
        setIsDropped
    ]);

    return (
        <OptionView {...{
            ...baseProps,
            onClick: handleClick,
            clicked
        }}/>
    )
}

const WithDropDownView = memo(({
    trigger,
    options,
    className,
    openDropDown,
    setIsDropped,
    isDropped,
    triggerRef,
    dropdownRef,
    left,
    right,
    top
}:  WithDropDownViewProps
) => {
    return (
        <>
            <div
                className={ 'dropdown-trigger ' + (className || '')}
                children={ trigger }
                ref={ triggerRef }
                onClick={ openDropDown }
            />
            { isDropped && 
                <Portal layer='dropdown'>
                    <div
                        ref={ dropdownRef }
                        className='dropdown'
                        style={{ left, right, top }}
                    >
                        { options.map( (option) => (
                            <Option {...{
                                ...option,
                                setIsDropped,
                                key: option.text
                            }}/>
                        ))}
                    </div>
                </Portal>
            }
        </>
    )
});

export const WithDropDown = forwardRef((
    props : WithDropDownProps,
    ref: ForwardedRef<WithDropDownRef>
) => {
    const [ isDropped, setIsDropped ] = useState(false);
    const [ top, setTop ] = useState<number | undefined>(undefined);
    const [ left, setLeft ] = useState<number | undefined>(undefined);
    const [ right, setRight ] = useState<number | undefined>(undefined);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const minPadding = 11;

    const openDropDown = useCallback((e: SyntheticEvent) => {
        e.stopPropagation();
        alignDropdown();
        setIsDropped(true)
    },[]);

    const closeDropDownOnClickOutside = useCallback((e: MouseEvent) => {
        if(dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement | null)) {
            setIsDropped(false)
        }
    },[]);

    const closeDropDown = useCallback(() => setIsDropped(false),[])

    useImperativeHandle(ref, () => ({
        closeDropDown,
        getWidth: () => triggerRef.current?.offsetWidth
    }));


    const alignDropdown = useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if(!rect) return
        
        const dropToRight = (rect.left + rect.width / 2) < (window.innerWidth * 2 / 3);

        if(dropToRight) {
            setLeft(Math.max(rect.left, minPadding));
            setRight(undefined);
        } else {
            setRight(Math.max(window.innerWidth - rect.right, minPadding));
            setLeft(undefined)
        }
        setTop(rect.bottom)
    },[]);

    useEffect(() => {
        window.addEventListener('resize', closeDropDown);
        document.addEventListener('mousedown', closeDropDownOnClickOutside);
        return () => {
            window.removeEventListener('resize', closeDropDown);
            document.removeEventListener('mousedown', closeDropDownOnClickOutside)
        }
    },[]);

    return (
        <WithDropDownView {...{
            ...props,
            openDropDown,
            setIsDropped,
            isDropped,
            triggerRef,
            dropdownRef,
            left,
            right,
            top
        }}/>
    )
})
