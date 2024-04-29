
import React from 'react';

import AppHero from '../components/home/hero';
import AppAbout from '../components/home/about';
import AppFeature from '../components/home/feature';
import AppWorks from '../components/home/works';
import AppLogin from '../components/home/login';

function AppHome({ loggedIn, onLogin }) {
  return (
    <div className="main">
      <AppHero/>
      <AppAbout/>
      <AppFeature/>
      <AppWorks/>
      <AppLogin loggedIn={loggedIn} onLogin={onLogin} />
    </div>
  );
}

export default AppHome;
