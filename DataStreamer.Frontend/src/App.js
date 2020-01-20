import React, { useEffect }  from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  useEffect(()=>{
    stream();
  }, [])

  function stream () {
    var getWebSocketMessages = function(onMessageReceived)
    {
        var url = `ws://localhost:32331/DataStream`      

        var webSocket = new WebSocket(url);
        webSocket.onmessage = onMessageReceived;
    };

    var ulElement = document.getElementById('StreamToMe');

    getWebSocketMessages(function (message) {
        ulElement.innerHTML = ulElement.innerHTML += `<li>${message.data}</li>`
    });
};

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        <ul id="StreamToMe"></ul>
      </header>
    </div>
  );
}

export default App;
