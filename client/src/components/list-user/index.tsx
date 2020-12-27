import React, { FunctionComponent } from 'react';
import UserComponent, { User } from './user';
import './index.css';


interface Props {
    className?: string,
    visible?: boolean,
    placement?: "left" | "top" | "right" | "bottom",
    users: User[]
}

const Users: FunctionComponent<Props> = ({
    className,
    visible = false,
    placement = "left",
    users
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
                                        user={user} 
                                        key={user._id}
                                        className='user' />)
                }
            {/* </Drawer> */}
        </div>
    );
}

export default Users;

