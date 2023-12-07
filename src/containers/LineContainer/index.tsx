import './styles.scss'

interface LineContainerProps {
    className?: string;
    [prop: string]: any
}

export const LineContainer = ({
    className,
    ...props
} : LineContainerProps
) => (
    <div
        className={ 'line-container ' + (className || '') }
        {...props}
    />
);
