
import React, { FunctionComponent } from 'react';
import './index.css';

export type User = {
    _id : string;
    name: string;
}

interface Props {
    user: User,
    className?: string
}

const Video: FunctionComponent<Props> = ({
    user,
    className
}) => {
    return (
        <div className={`${className}`}>
            <video></video>
            <p>{user.name}</p>
        </div>
    );
}

export default Video;

