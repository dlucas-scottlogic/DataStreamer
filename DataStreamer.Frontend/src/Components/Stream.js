import React, { useEffect }  from 'react';
import $ from 'jquery';
import {DataStreamURL} from '../Api-config';

function Stream() {  

    useEffect(()=>{
        stream();
    }, [])

    function stream () {
        var getWebSocketMessages = function(onMessageReceived)
        {
            var webSocket = new WebSocket(DataStreamURL);
            webSocket.onmessage = onMessageReceived;
        };

        var updateDom = function (message) {
            var data = JSON.parse(message.data);  

            var listLength = $("#demo-content div").length

            // limit list size
            if(listLength > 25){
                $("#demo-content .dataitem:last-child").remove();
            }

            // insert content divs, after the field headers
            $("#demo-content #field-headers").after(`
            <div class="dataitem">
                <span>${data.firstName}</span>
                <span>${data.age}</span>
                <span>${data.username}</span>
            </div>`);
        }       

        getWebSocketMessages(updateDom);
    };

    return (      
        <div id="demo-content">             
            <div id="field-headers">
                <label>Name</label>
                <label>Age</label>
                <label>Job Title</label>
            </div>
        </div>        
    )
}

export default Stream;