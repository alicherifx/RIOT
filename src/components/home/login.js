import React from 'react';
import { Form, Input, Button } from 'antd';
import { CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined,} from '@ant-design/icons';
import vid from '../../assets/videos/silvergoku.mp4'

function AppLogin({ loggedIn, onLogin }) {
  const onFinish = (values) => {
    onLogin(values);
  };

  if (loggedIn) {
    return (
      <div id="robot-control" className="block" style={{ height: '100%' }}>
        <div className="container-fluid" style={{ height: '100%' }}>
          <div className="titleHolder">
            <h2>Robot Control</h2>
          </div>
          <div className="video-and-controls" style={{ display: 'flex', height: '100%' }}>
            <div className="control-buttons" style={{ flex: 1 }}>
              <div style={{ margin: '8px' }}>
                <Button type="primary" icon={<CaretUpOutlined />} />
              </div>
              <div style={{ padding: '8px' }}>
                <Button type="primary" icon={<CaretLeftOutlined />} style={{ marginRight: '8px' }} />
                <Button type="primary">Stop</Button>
                <Button type="primary" icon={<CaretRightOutlined />} style={{ marginLeft: '8px' }} />
              </div>
              <div style={{ marginTop: '8px' }}>
                <Button type="primary" icon={<CaretDownOutlined />} />
              </div>
            </div>
            <div className="video-container" style={{ flex: 1, height: '100%' }}>
              <h1>Live Streaming</h1>
              <video controls width="100%" height="100%">
                <source src={vid} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="divider" style={{ width: '2px', height: '100%', background: '#ccc' }}></div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div id="login" className="block loginBlock">
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