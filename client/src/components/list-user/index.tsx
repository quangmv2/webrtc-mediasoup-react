import React, { FunctionComponent } from 'react';
import UserComponent, { User } from './user';
import './index.css';
import { RoomClient } from '../../services/RoomClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import 'swiper/swiper.min.css';


interface Props {
    className?: string,
    visible?: boolean,
    placement?: "left" | "top" | "right" | "bottom",
    users: User[],
    onClickUser: Function,
    roomClient?: RoomClient,
    user?: User
}

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

const Users: FunctionComponent<Props> = ({
    className,
    visible = false,
    placement = "left",
    users,
    onClickUser,
    roomClient,
}) => {

    return (
        <div className={`${className} list-user`}
            style={{
                height: visible ? "100%" : "0px"
            }}
        >
            {
                users.map(user => (<UserComponent
                        onClick={onClickUser}
                        user={user}
                        roomClient={roomClient}
                        key={user._id}
                        className='user' />))
            }
        </div >
    );
}

export default Users;

