import React, {useState, useEffect} from 'react';
import {openFile} from '../Helper';
import {DataStreamURL} from '../Api-config';
import DataStream from './DataStream'

const DataStreamComponent = () => {
    let context = {};

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

    const onClickSetProfile = (e) => {        
        openFile('.json')
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

    return (
    <React.Fragment>
        <h1 className="icon-header title" onClick={onClickSetProfile}>DataHelix Generator</h1>
        <DataStream context={context} jsonProfile={jsonProfile}/>
    </React.Fragment>);
  }

export default DataStreamComponent;