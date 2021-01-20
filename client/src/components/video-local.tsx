import React, {FunctionComponent, memo,  useEffect, useRef } from 'react';
import './index.css';


interface Props {
    className?: string,
    stream?: MediaStream
}

const Video: FunctionComponent<Props> = ({
    className,
    stream
}) => {

    const canvas = useRef<HTMLCanvasElement>(null);
    const video = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        video.current.srcObject = stream
    }, [stream])

    return (
        <div className={`${className}`}>
            <video autoPlay playsInline ref={video}>

            </video>
            {/* <canvas width="1280" height="720" ref={canvas}>
            </canvas> */}
        </div>
    );
}

export default memo(Video);

