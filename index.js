const { Neurosity } = require("@neurosity/sdk");
require('dotenv').config();
const osc = require("osc"); // Add this line

const deviceId = process.env.DEVICE_ID || "";
const email = process.env.EMAIL || "";
const password = process.env.PASSWORD || "";

const verifyEnvs = (email, password, deviceId) => {
  const invalidEnv = (env) => {
    return (env === "");
  }
  if (invalidEnv(email) || invalidEnv(password) || invalidEnv(deviceId)) {
      console.error("Please verify deviceId, email and password are in .env file, quitting...");
      process.exit(0);
  }
}
verifyEnvs(email, password, deviceId);
console.log(`${email} attempting to authenticate with ${deviceId}`);

const neurosity = new Neurosity({
  deviceId
});

// Create an OSC UDP Port
const udpPort = new osc.UDPPort({
  localAddress: "127.0.0.1",
  localPort: 0, // Use any available port for sending
  remoteAddress: "127.0.0.1",
  remotePort: 6969
});
udpPort.open();

const main = async () => {
  await neurosity.login({
    email,
    password
  })
  .catch(error => {
    console.log(error);
    throw new Error(error);
  });
  console.log("Logged in");

  neurosity.calm().subscribe((calm) => {


  console.log("Calm data:", calm);

    // Send OSC message with calm probability
    udpPort.send({
      address: "/pairDistance",
      args: [
{
          type: "f",
          value: calm.probability
        },
        {
          type: "f",
          value: calm.timestamp
        }
      ]
    });
  });

}

main();