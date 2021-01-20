import React, { FunctionComponent, RefObject, useEffect } from 'react';
import './video-container.css';
import Video from './video';
import VideoLocal from './video-local';
import IconWebinar from "../assets/webinar-icon.png";
import * as faceapi from "../services/dist/face-api.js";

interface Props {
    local: MediaStream,
    remote: MediaStream,
}

const VideoContainer: FunctionComponent<Props> = ({
    remote,
    local
}) =>  {

    useEffect(() => {
        console.log(faceapi);
        // loadAiModels()
    }, [])

    return (
        <div className='video-container'>
            <img src={IconWebinar} className="icon-home" alt="webinar-icon.png" />
            
            <VideoLocal className="local-video" stream={local} />
            <Video className="remote-video" stream={remote} />
            {/* <div id="remoteAudios"></div> */}
        </div>
    );
}

export default VideoContainer;

