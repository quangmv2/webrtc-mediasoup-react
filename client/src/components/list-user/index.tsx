import React, { FunctionComponent } from 'react';
import UserComponent, { User } from './user';
import './index.css';
import { RoomClient } from '../../services/RoomClient';


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
            {/* <Drawer
                // title="Basic Drawer"
                placement={placement}
                closable={false}
                zIndex={0}
                // onClose={this.onClose}
                visible={visible}
                key={placement}
            > */}
                {
                    users.map(user => <UserComponent 
                                        onClick={onClickUser}
                                        user={user} 
                                        roomClient={roomClient}
                                        key={user._id}
                                        className='user' />)
                }
            {/* </Drawer> */}
        </div>
    );
}

export default Users;

