import { exec } from "child_process";
import fs from "fs";
import xml2js from "xml2js";

const outputXmlPath = "backend/output/ports_output.xml";
const outputJsonPath = "backend/output/ports_output.json";
const nucleiTargetsPath = "backend/output/nuclei_targets.txt";

export function scanPorts(targetIP = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    exec(`nmap ${targetIP} -oX ${outputXmlPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while running Nmap: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Nmap stderr: ${stderr}`);
      }

      fs.readFile(outputXmlPath, "utf8", (err, data) => {
        if (err) {
          console.error(`Error reading ${outputXmlPath}: ${err.message}`);
          reject(err);
          return;
        }

        xml2js.parseString(
          data,
          { explicitArray: false },
          (parseErr, result) => {
            if (parseErr) {
              console.error(`Error parsing XML: ${parseErr.message}`);
              reject(parseErr);
              return;
            }

            if (!result || !result.nmaprun || !result.nmaprun.host) {
              console.warn("No host data found");
              resolve({ message: "No host data found", target: targetIP });
              return;
            }

            // Save the entire JSON result
            fs.writeFileSync(outputJsonPath, JSON.stringify(result, null, 2));

            const host = result.nmaprun.host;
            const ip = host.address?.$.addr || targetIP;
            const ports = Array.isArray(host.ports?.port)
              ? host.ports.port
              : [host.ports?.port];

            const openPorts = [];

            if (ports) {
              ports.forEach((port) => {
                const portId = port.$.portid;
                const protocol = port.$.protocol;
                const state = port.state.$.state;
                const serviceName = port.service?.$.name || "N/A";
                const product = port.service?.$.product || "N/A";
                const version = port.service?.$.version || "N/A";

                console.log(
                  `- ${portId}/${protocol} (${serviceName}) - ${state}`
                );

                if (state === "open") {
                  openPorts.push({
                    port: portId,
                    protocol,
                    service: serviceName,
                    product,
                    version,
                  });
                }
              });
            } else {
              console.log("No open ports detected.");
            }

            resolve({
              target: targetIP,
              timestamp: new Date(),
              openPorts,
              rawData: result,
            });
          }
        );
      });
    });
  });
}

// Export but don't auto-run when imported
export default scanPorts;
