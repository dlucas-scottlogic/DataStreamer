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

    var container = document.getElementById('StreamToMe');

    getWebSocketMessages(function (message) {
      console.log(message.data);
      var data = JSON.parse(message.data);      
      container.innerHTML =  `<tr><td>${data.firstName}</td> <td>${data.age}</td> <td>${data.username}</td></tr>` + container.innerHTML
    });
};

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />        
        <table id="StreamToMe"></table>
      </header>
    </div>
  );
}

export default App;
