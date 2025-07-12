const { exec } = require('child_process');
const fs = require('fs');
const xml2js = require('xml2js');

const targetIP = '127.0.0.1'; 
const nmapOutputFile = 'output/ports_output.xml'; 

function scanPorts() {
    exec(`nmap ${targetIP} -oX ${nmapOutputFile}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error while running Nmap: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Nmap stderr: ${stderr}`);
        }

        fs.readFile(nmapOutputFile, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error while reading file ${nmapOutputFile}: ${err.message}`);
                return;
            }

            xml2js.parseString(data, { explicitArray: false }, (parseErr, result) => {
                if (parseErr) {
                    console.error(`Error: ${parseErr.message}`);
                    return;
                }

                if (!result || !result.nmaprun || !result.nmaprun.host) {
                    console.warn('No information about host');
                    return;
                }

                const host = result.nmaprun.host;
                console.log(`\nHost information: ${host.address.$.addr}`);

                if (host.ports && host.ports.port) {
                    const ports = Array.isArray(host.ports.port) ? host.ports.port : [host.ports.port]; 

                    console.log('\nList of opened ports:');
                    ports.forEach(port => {
                        const portId = port.$.portid;
                        const protocol = port.$.protocol;
                        const state = port.state.$.state;
                        const serviceName = port.service ? port.service.$.name : 'N/A';
                        const serviceProduct = port.service && port.service.$.product ? port.service.$.product : 'N/A';
                        const serviceVersion = port.service && port.service.$.version ? port.service.$.version : 'N/A';

                        console.log(`
                        Port: ${portId}/${protocol}
                        State: ${state}
                        Service: ${serviceName}
                        Product: ${serviceProduct}
                        Version: ${serviceVersion}
                        ----------------------------------
                        `);
                    });
                } else {
                    console.log('No opened ports');
                }

                /*fs.unlink(nmapOutputFile, (unlinkErr) => {
                    if (unlinkErr) {
                        console.warn(`Cannot delete file ${nmapOutputFile}: ${unlinkErr.message}`);
                    } 
                });*/
            });
        });
    });
}
scanPorts()