import React, {useState, useEffect} from 'react';
import {openFile} from '../Helper';
import {DataStreamURL} from '../Api-config';

const DataStream = ({ context }) => {  

    var nextId = 1;
    var webSocket = context.webSocket;
    
    const defaultFields = [
        {"name": "FirstName", "type": "faker.Address.firstName" },
        {"name": "FirstLast", "type": "faker.Address.lastName" },
        {"name": "Age", "type": "integer" },
        {"name": "Industry", "type": "faker.job.field" },
        {"name": "JobTitle", "type": "faker.job.position" }
      ]

    const defaultConstraints = [
        {"field": "Age", "greaterThan": 0},
        {"field": "Age", "lessThan": 100}
    ]
    
    var defaultJsonProfile = {
        "fields": defaultFields,
        "constraints": defaultConstraints
    };

    const [jsonProfile, setJsonProfile] = useState(defaultJsonProfile);    
    const [dataSpanList, setDataSpanList] = useState([]);    

    useEffect(() => stream(), [jsonProfile])

    const onClickSetProfile = (e) => {        
        openFile('.json', false)
            .then(
                files => {                       
                    var filename = Object.keys(files)[0];
                    var profile = files[filename];                                    
                        var fileContent = JSON.parse(profile.content);
                        if (!fileContent.fields) {
                            return;
                        }                        
                        
                        setDataSpanList([]);
                        setJsonProfile(fileContent);
            })                    
    }
    
    const stream = () => { 
        if(context.webSocket != null){
            context.webSocket.close();

            setDataSpanList([]);
        }
        if (context.reloadHandle) {
            window.clearTimeout(context.reloadHandle);
            context.reloadHandle = null;
        }

        context.webSocket = new WebSocket(DataStreamURL);
        let rows = [];

        context.webSocket.onopen = function(event){ 
            var dataProfile = {                
                'maxRows': 99999999,
                'jsonProfile' : JSON.stringify(jsonProfile)
            }          
            context.webSocket.send(JSON.stringify(dataProfile));
        }            

        context.webSocket.onmessage = function (message) {
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
                context.webSocket.send("next");
            }, 100);
        }        

        context.webSocket.onerror = function(error) {
            console.log('WebSocket Error: ' + error);
        };
        
        window.onbeforeunload = function() {
            webSocket.onclose = function() { };
            webSocket.close();
        }
    }

    return (
        <React.Fragment>
            <h1 className="icon-header title" onClick={onClickSetProfile}>DataHelix Generator</h1>

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
        </React.Fragment> 
    );          
}

export default DataStream;