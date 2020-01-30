import React, {useState, useEffect} from 'react';
import {openFile} from '../Helper';
import {DataStreamURL} from '../Api-config';

function DataStream() {  

    var webSocket;
    var nextId = 1;
    
    const defaultFields = [
        { "name": "Name", "type": "firstname" },
        { "name": "Age", "type": "integer" },     
        { "name": "JobTitle", "type": "string" }        
    ]

    const defaultConstraints = [
        { "field": "JobTitle", "matchingRegex": "[a-z]{1,10}" },
        { "field": "Age", "greaterThan": 0 },
        { "field": "Age", "lessThan": 100 }       
    ]
    
    var defaultJsonProfile = {
        "fields": defaultFields,
        "constraints": defaultConstraints
    };

    const [jsonProfile, setJsonProfile] = useState(defaultJsonProfile);    
    const [dataSpanList, setDataSpanList] = useState([]);    

    useEffect(stream,[jsonProfile])

    function onClickSetProfile(){        
        openFile('.json', false)
            .then(
                files => {                       
                    var filename = Object.keys(files)[0];
                    var profile = files[filename];                                    
                        var fileContent = JSON.parse(profile.content);
                        if (!fileContent.fields) {
                            return;
                        }                        
                        
                        setJsonProfile(fileContent);
            })                    
    }
    
    function stream() { 
        if(webSocket != null){
            webSocket.close();
        }
        webSocket = new WebSocket(DataStreamURL);        

        webSocket.onopen = function(event){ 
            var dataProfile = {                
                'streamDelay': 500,
                'maxRows': 99999999,
                'jsonProfile' : JSON.stringify(jsonProfile)
            }          
            webSocket.send(JSON.stringify(dataProfile));
        }            

        webSocket.onmessage = function (message) {
            var data = JSON.parse(message.data);  
            data.uid = nextId++;

            if (dataSpanList.length >= 25) {
                dataSpanList.pop();
            }

            dataSpanList.unshift(data);

            let newRows = [ ];
            dataSpanList.forEach(row => newRows.push(row));

            setDataSpanList(newRows);
        }       

        webSocket.onerror = function(error) {
            console.log('WebSocket Error: ' + error);
            };             
    }

    return (   
        <React.Fragment>
            <div>
                <span>
                    <button id="setProfileButton" onClick={onClickSetProfile}>Upload profile</button>
                </span>
            </div>

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