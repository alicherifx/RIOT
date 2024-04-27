import React, { useState } from 'react';

import { Form, Input, Button } from 'antd';

function AppLogin() {
  const [loggedIn, setLoggedIn] = useState(false);

  const onFinish = (values) => {
    const { username, password } = values;
    if (username === 'admin' && password === 'admin') {
      setLoggedIn(true);
      console.log("logged")
    }
  };

  return (
    <div id="login" className={`block ${loggedIn ? 'hidden' : 'loginBlock'}`}>
      <div className="container-fluid">
        <div className="titleHolder">
          <h2>Login</h2>
        </div>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input type="password" placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default AppLogin;
