import React from 'react';
import Taiwanmap from './Taiwanmap';
import './App.css';
import ReactGA from 'react-ga';
ReactGA.initialize('UA-158033292-1');
ReactGA.pageview(window.location.pathname + window.location.search);
function App() {
  return (
    <div id="App" >
        <Taiwanmap></Taiwanmap>
    </div>
  );
}

export default App;
