import React, { useEffect }  from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';

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

    var updateDom = function (message) {
      var data = JSON.parse(message.data);  

      var listLength = $("#StreamToMe div").length
      
      if(listLength > 24){
          $('#StreamToMe div:last-child').remove();
      }

      container.innerHTML =  `<div id="dataitem">${data.firstName} - ${data.age} - ${data.username}</div>` + container.innerHTML
    }

    getWebSocketMessages(updateDom);
};

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />        
        <div id="StreamToMe"></div>
      </header>
    </div>
  );
}

export default App;
