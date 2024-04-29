// App.js
import React, { useState } from 'react';
import './App.css';
import AppHeader from './components/common/header';
import AppFooter from './components/common/footer';
import AppHome from './views/home';

import { Layout } from 'antd';
const { Header, Content, Footer } = Layout;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = (values) => {
    const { username, password } = values;
    if (username === 'admin' && password === 'admin') {
      setLoggedIn(true);
    }
  };

  return (
    <Layout className="mainLayout">
      <Header>
        <AppHeader loggedIn={loggedIn}/>
      </Header>
      <Content>
        <AppHome loggedIn={loggedIn} onLogin={handleLogin}/>
      </Content>
      <Footer>
        <AppFooter/>  
      </Footer>      
    </Layout>
  );
}

export default App;
