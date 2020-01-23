import React, { useEffect }  from 'react';
import $ from 'jquery';

function Stream() {  

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
        
        if(listLength > 7){
            $('#StreamToMe div:last-child').remove();
        }

        container.innerHTML =  `<div>
        <span>${data.firstName}</span>
        <span>${data.age}</span>
        <span>${data.username}</span>
        </div>` + container.innerHTML
        }

        getWebSocketMessages(updateDom);
    };

    return (
        <div>
            <div>
                <label>Field 1</label>
                <label>Field 2</label>
                <label>Field 3</label>
            </div>
            <div id="StreamToMe"></div>
        </div>
    )

}

export default Stream;