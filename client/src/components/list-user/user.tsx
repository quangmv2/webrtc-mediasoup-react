
import { Consumer } from 'mediasoup/lib/types';
import React, { FunctionComponent, memo, useEffect, useRef } from 'react';
import { EVENTS, EVENT_CHANGE_STREAM, RoomClient } from '../../services/RoomClient';
import './index.css';

export type User = {
    _id: string;
    name: string;
    consumers?: Map<string, Consumer>
}

interface Props {
    user: User,
    className?: string,
    onClick: Function,
    roomClient?: RoomClient
}

const Video: FunctionComponent<Props> = ({
    user,
    className,
    onClick,
    roomClient
}) => {

    const video = useRef<HTMLVideoElement>(null);
    const audio = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        console.log("user", user);
        
        if (!roomClient) return;
        addVideoStream()
        roomClient.addListener(EVENTS.onChangeStream, changeStream)
        return () => roomClient.removeListener(EVENTS.onChangeStream, changeStream)
    }, [roomClient, user])

    const changeStream = (_id: string, type?: string) => {
        if (_id != user._id) return;
        if (type == EVENT_CHANGE_STREAM.add) {
            addVideoStream()
            addAudioStream()
        }
        else {
            if (video && video.current)
                video.current.srcObject = null
        }
    }

    const addAudioStream = () => {
        if (!roomClient) return;
        const stream: MediaStream[] = roomClient.getStreamsAudioById(user._id)
        if (audio && audio.current && stream.length > 0)
            audio.current.srcObject = stream[0]
        console.log("user", stream);
    }

    const addVideoStream = () => {
        if (!roomClient) return;
        const stream: MediaStream[] = roomClient.getStreamsById(user._id)
        if (video && video.current && stream.length > 0)
            video.current.srcObject = stream[0]
        console.log("user", stream);
    }

    return (
        <div className={`${className}`} onClick={() => onClick(user._id)}>
            <video ref={video} autoPlay playsInline ></video>
            <p>{user.name}</p>
            <audio autoPlay ref={audio} ></audio>
        </div>
    );
}

export default memo(Video);

