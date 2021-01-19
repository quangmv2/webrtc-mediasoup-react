import React, { FunctionComponent, RefObject } from 'react';
import './video-container.css';
import Video from './video';
import IconWebinar from "../assets/webinar-icon.png";

interface Props {
    local: RefObject<any>,
    remote: RefObject<any>,
}

const VideoContainer: FunctionComponent<Props> = ({
    remote,
    local
}) =>  {
    return (
        <div className='video-container'>
            <img src={IconWebinar} className="icon-home" alt="webinar-icon.png" />
            
            <Video ref={local} className="local-video" />
            <Video ref={remote} className="remote-video" />
            {/* <div id="remoteAudios"></div> */}
        </div>
    );
}

export default VideoContainer;

