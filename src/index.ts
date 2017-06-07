'use strict'

import * as mdns from 'mdns';
import { mutil } from './tradfri/mutil';
import { TradfriClient, DeviceTypes } from './tradfri/tradfri';



function init() {
  var sequence = [
    mdns.rst.DNSServiceResolve(),
    mdns.rst.getaddrinfo({families:[4]}),
    mdns.rst.makeAddressesUnique()
  ];

  var client: TradfriClient = null;

  const browser = mdns.createBrowser(mdns.udp('coap'), { resolverSequence: sequence })
  browser.on('serviceUp', (service) => {
    client = new TradfriClient((a,b) => console.log(a, b), {psk: }, service.addresses.pop(), service.port)

    client.getDevices().then((devices) => {
      console.log('Devices', JSON.stringify(devices, null, 2));
      devices.forEach((device) => {

        if (device.type === DeviceTypes.LIGHTBULB) {
          client.setBrightness(device.deviceId, 1, 20);
        }
      })
    }).catch((err) => {
      console.log(err)
    })
  })
  browser.on('serviceDown', (service) => {
    console.log('Dns Service down: ', service)
  })
  browser.on('error', (error) => {
    console.log('Dns Error:', error)
  })
  browser.start();
}

init();
