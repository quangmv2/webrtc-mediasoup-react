import React, { FunctionComponent, useRef } from 'react';
import UserComponent, { User } from './user';
import './index.css';
import { RoomClient } from '../../services/RoomClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
// Import Swiper styles
import 'swiper/swiper.scss';
import 'swiper/components/navigation/navigation.scss';
import 'swiper/components/pagination/pagination.scss';
import 'swiper/components/scrollbar/scrollbar.scss';

// install Swiper components
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);


interface Props {
    className?: string,
    visible?: boolean,
    placement?: "left" | "top" | "right" | "bottom",
    users: User[],
    onClickUser: Function,
    roomClient?: RoomClient,
    user?: User
}

const Users: FunctionComponent<Props> = ({
    className,
    users,
    onClickUser,
    roomClient,
    visible
}) => {

    return (
        <div className={`${visible ? "" :"hidden"} list-user`}
        >
                    {
                        users.map((user, index) => (
                            // <SwiperSlide
                            //     key={user._id + index + "wiper"}
                            //     className="item-user"
                            // >
                                <UserComponent
                                    onClick={onClickUser}
                                    user={user}
                                    roomClient={roomClient}
                                    key={user._id + "user "}
                                    className='user' />
                            // </SwiperSlide>
                            )
                        )
                    }
        </div >
    );
}

export default Users;

