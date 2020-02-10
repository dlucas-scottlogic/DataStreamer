import React, {useState, useEffect} from 'react';
import {DataStreamURL} from '../Api-config';

const DataStream = ({ context, jsonProfile}) => {  

    var nextId = 1;
    var webSocket; 
    
    const [dataSpanList, setDataSpanList] = useState([]);    

    useEffect(() => stream(), [jsonProfile])

    const stream = () => { 
        setDataSpanList([]);

        if(webSocket != null){
            webSocket.close();            
        }
        if (context.reloadHandle) {
            window.clearTimeout(context.reloadHandle);
            context.reloadHandle = null;
        }

        webSocket = new WebSocket(DataStreamURL);
        let rows = [];

        webSocket.onopen = function(event){ 
            var dataProfile = {                
                'maxRows': 99999999,
                'jsonProfile' : JSON.stringify(jsonProfile)
            }          
            webSocket.send(JSON.stringify(dataProfile));
        }            

        webSocket.onmessage = function (message) {
            var data = JSON.parse(message.data);  
            data.uid = nextId++;

            if (rows.length >= 25) {
                rows.pop();
            }

            rows.unshift(data);

            setDataSpanList(() => {
                return [ ...rows ];
            });            
                     
            context.reloadHandle = window.setTimeout(function() {
                webSocket.send("next");
            }, 100);
        }        

        webSocket.onerror = function(error) {
            console.log('WebSocket Error: ' + error);
        };
        
        window.onbeforeunload = function() {
            webSocket.onclose = function() { };
            webSocket.close();
        }

        return function cleanup(){            
            if(webSocket.readyState === webSocket.OPEN || webSocket.readyState === webSocket.CONNECTING){
                console.log('cleanup - closing websocket')
                webSocket.close();
            }            
        };
    }

    return (
            <div id="demo-content">   
                <div id="field-headers">
                    {jsonProfile.fields.map(item =>
                        <label key={item.name}>{item.name}</label>
                    )} 
                </div>
                {dataSpanList.map(row =>
                    (<div className="dataitem" key={row.uid}>
                        {jsonProfile.fields.map(field => (<span key={row.uid + '_' + field.name}>{row[field.name]}</span>))}
                    </div>)
                )}          
            </div>
    );          
}

export default DataStream;