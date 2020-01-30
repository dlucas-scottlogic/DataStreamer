import React from 'react';
import DataStream from './Components/DataStream'
import './Styles/Bootstrap.css';
import './Styles/Style.css';
import './Styles/App.css';

function App() {
    let context = {};

  return (    
    <div className="App">
        <nav className="navbar navbar-expand-lg">
            <a className="navbar-brand" href="http://localhost:32330">DataHelix Generator</a>
            <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarNavDropdown"
                aria-controls="navbarNavDropdown"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div id="navbarNavDropdown" className="navbar-collapse collapse">
                <ul className="navbar-nav mr-auto"></ul>
                <ul className="navbar-nav ">
                <li className="nav-item">
                    <a
                    className="nav-link" 
                    href="https://github.com/finos/datahelix/">GitHub</a>
                </li>
                <li className="nav-item">
                    <a
                    className="nav-link"
                    href="https://github.com/finos/datahelix/blob/master/docs/GettingStarted.md">Getting Started</a>
                </li>
                <li className="nav-item">
                    <a 
                    className="nav-link"
                    href="https://github.com/finos/datahelix/blob/master/docs/UserGuide.md">User Guide</a>
                </li>
                <li className="nav-item">
                    <a 
                    className="nav-link" 
                    href="https://finos.github.io/datahelix/playground/">Online Playground</a>
                </li>
                </ul>
            </div>
        </nav>

        <div className="jumbotron">
            <h1 className="icon-header title">DataHelix Generator</h1>            
              <DataStream context={context} />
            
        </div>

        <div className="container">
        <div className="row features">
            <div className="col-sm">
            <h2 className="icon-header open-source">Open source</h2>
            Open-sourced within <a href="https://www.finos.org/">FINOS</a> and actively developed by a passionate team
            </div>
            <div className="col-sm">
            <h2 className="icon-header declarative-rules">Declarative rules</h2>
            Simple declarative syntax that mimics business rules
            </div>
            <div className="col-sm">
            <h2 className="icon-header open-architecture">Open architecture</h2>
            Open and extensible architecture
            </div>
            <div className="col-sm">
            <h2 className="icon-header big-data">Big data</h2>
            Generate large volumes of data – many fields, many rows, or both
            </div>
        </div>
        </div>

        <div className="notices">
        <div className="container">
            <div className="row">
            <div className="col-sm">
                <p>Copyright 2019 Scott Logic Ltd</p>
                <p>Distributed under the Apache License, Version 2.0.</p>
                <p>SPDX-License-Identifier: Apache-2.0</p>
            </div>
            </div>
        </div>
        </div>    
    </div>
  );
}

export default App;
