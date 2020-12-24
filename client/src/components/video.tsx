import React, { forwardRef, FunctionComponent, Ref, RefObject } from 'react';
import './index.css';

interface Props{
    className?: string,
}

const Video  = forwardRef<HTMLDivElement, Props>(({
    className,
}, ref) =>  {
    return (
        <div className={`${className}`} ref={ref}>

        </div>
    );
})

export default Video;

