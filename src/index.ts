'use strict'

import * as mdns from 'mdns';
import { mutil } from './tradfri/mutil';
import { tradfri } from './tradfri/tradfri';



function init() {
  var sequence = [
    mdns.rst.DNSServiceResolve(),
    mdns.rst.getaddrinfo({families:[4]}),
    mdns.rst.makeAddressesUnique()
  ];

  var client = null

  const browser = mdns.createBrowser(mdns.udp('coap'), { resolverSequence: sequence })
  browser.on('serviceUp', (service) => {
    client = new tradfri.Client((a,b) => console.log(a, b), {psk: 'xcfnC3cfeIQmrIcg'}, service.addresses.pop(), service.port)

    client.getDevices().then((devices) => {
      console.log('Devices', JSON.stringify(devices, null, 2));
      devices.forEach((device) => {
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
