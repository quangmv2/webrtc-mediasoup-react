import { Button, Input } from 'antd';
import { Form } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import React, { FunctionComponent, useEffect, useState } from 'react';
import './login.css';
import IconWebinar from "../assets/webinar-icon.png";


const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

interface Props {
    onLogin: (name: string, room_id: string) => void
}

const Login: FunctionComponent<Props> = ({
    onLogin
}) => {

    const submit = (values: any) => {
        onLogin(values.username, values.room);
        console.log(values);
    }

    return (
        <div className="login">
            <img src={IconWebinar} className="icon-home" alt="webinar-icon.png" />
            <Form
                {...layout}
                name="basic"
                initialValues={{ username: Math.round(Math.random() * 1000) + '', room: "123", remember: true }}
                onFinish={submit}
            //   onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}

                >
                    <Input
                        autoFocus={true}
                    />
                </Form.Item>

                <Form.Item
                    label="Room"
                    name="room"
                    rules={[{ required: true, message: 'Please input your room!' }]}

                >
                    <Input
                    />
                </Form.Item>

                <Form.Item {...tailLayout} name="remember" valuePropName="checked">
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Join to room
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default Login;
