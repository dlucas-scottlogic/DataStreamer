import React, { useEffect }  from 'react';
import $ from 'jquery';
import {DataStreamURL} from '../Api-config';

function DataStream() {  

    const fields = [
        { "name": "Name", "type": "firstname" },
        { "name": "Age", "type": "integer" },     
        { "name": "JobTitle", "type": "string" }        
      ]
    const dataProfile = {                
        'maxRows': 999999999,
        'jsonProfile' : JSON.stringify({
            "fields": fields,
            "constraints": [
                { "field": "JobTitle", "matchingRegex": "[a-z]{1,10}" },
                { "field": "Age", "greaterThan": 0 },
                { "field": "Age", "lessThan": 100 }       
            ]
        })
    }
    useEffect(()=>{
        stream();
    }, [])

    function stream () {
        let webSocket = new WebSocket(DataStreamURL);

        webSocket.onopen = function(event){           
            webSocket.send(JSON.stringify(dataProfile));
        }            

        webSocket.onmessage = function (message) {
            var data = JSON.parse(message.data);  

            var listLength = $("#demo-content div").length

            // limit list size
            if(listLength > 25){
                $("#demo-content .dataitem:last-child").remove();
            }

            var dataSpanList = fields.map(item =>
                `<span>${data[item.name]}</span>`
                ).join('');

            // insert content divs, after the field headers
            $("#demo-content #field-headers").after(`
            <div class="dataitem">
               ${dataSpanList}          
            </div>`);
         
            window.setTimeout(function() {
                webSocket.send("next");
            }, 100);
        }
        
        window.onbeforeunload = function() {
            webSocket.onclose = function() { };
            webSocket.close();
        }

        webSocket.onerror = function(error) {
            console.log('WebSocket Error: ' + error);
        };
    }

    return (      
        <div id="demo-content">
            <div id="field-headers">
            {fields.map(item =>
                <label>{item.name}</label>
            )}                           
            </div>
        </div>        
    );          
}

export default DataStream;