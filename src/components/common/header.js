import React, { useState } from 'react';
import { Anchor, Drawer, Button } from 'antd';

const { Link } = Anchor;

function AppHeader({ loggedIn, onLogout }) {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <div className="container-fluid">
      <div className="header">
        <div className="logo">
          <i className="fas fa-bolt"></i>
          <a href="#hero">Projet Pfe</a>
        </div>
        <div className="mobileHidden">
          <Anchor targetOffset="65">
            <Link href="#hero" title="Home" />
            <Link href="#about" title="About" />
            <Link href="#feature" title="Features" />
            <Link href="#works" title="How it works" />
            {loggedIn ? (
              <>
                <Link href="#robot-control" title="Streaming" />
                <Link  href="#logout" className="header-link"  >
                <a style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}onClick={handleLogout}>Logout </a>
                </Link>
              </>
            ) : (
              <Link href="#login" title="Login" />
            )}
          </Anchor>
        </div>
        <div className="mobileVisible">
          <Button type="primary" onClick={showDrawer}>
            <i className="fas fa-bars"></i>
          </Button>
          <Drawer
            placement="right"
            closable={false}
            onClose={onClose}
            open={visible}
          >
            <Anchor targetOffset="65">
              <Link href="#hero" title="Home" />
              <Link href="#about" title="About" />
              <Link href="#feature" title="Features" />
              <Link href="#works" title="How it works" />
              {loggedIn ? (
                <>
                  <Link href="#robot-control" title="Streaming" />
                  <Link  className="header-link" onClick={handleLogout} title="Logout"/>
                </>
              ) : (
                <Link href="#login" title="Login" />
              )}
            </Anchor>
          </Drawer>
        </div>
      </div>
    </div>
  );
}

export default AppHeader;
