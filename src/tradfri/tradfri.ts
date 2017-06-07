'use strict'

import { mutil } from "./mutil";
import { format } from './format';
import { COAP } from './coap';

const serial = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))

const deviceEndpoint = '/15001/'

export const DeviceTypes = {
  REMOTE: 0,
  LIGHTBULB: 2
}

export type DeviceType = {
  type: number
  deviceId: string
  name: string
  createdAt: number
  lastSeen: number
  reachableState: number
  light?: LightType
}

export type LightType = {
  id?: number
  color?: string
  colorX?: number
  colorY?: number
  brightness?: number
  power?: number
}

export class TradfriClient {
  log: (format: string, message: any) => void;
  coap: COAP.Client;

  constructor (log, config: {psk: string}, hostname, port) {
    this.log = log
    this.coap = new COAP.Client(log, config, hostname, port)
  }

  getDevices (): Promise<DeviceType[]> {
    return new Promise((resolve, reject) => {
      this.coap.get(deviceEndpoint).then((resp) => {
        let ids = JSON.parse(resp)
        let funcs = ids.map((id) => {
          return () => {
            return this.coap.get(deviceEndpoint + id)
          }
        })

        serial(funcs).then((data) => {
          const devices = data.map((device) => {
            let object = JSON.parse(device)
            return format.readable(object)
          })
          resolve(devices)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }

  getDevice (deviceId): Promise<DeviceType> {
    return new Promise((resolve, reject) => {
      this.coap.get(deviceEndpoint + deviceId).then((resp) => {
        let object = format.readable(JSON.parse(resp))
        resolve(object)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  setBrightness (deviceId: string, brightness: number, transitionTime: number = 5) {
    return new Promise((resolve, reject) => {
      let scaled = mutil.scale({
        fromMax: 100,
        toMax: 254
      }, brightness)

      let payload = format.compact({
        light: [{
          power: (brightness > 0) ? 1 : 0,
          brightness: scaled,
          transitionTime,
        }]
      })

      this.coap.put(deviceEndpoint + deviceId, payload).then(() => {
        resolve()
      }).catch((err) => {
        reject(err)
      })
    })
  }

  turnOn (deviceId: string): Promise<{}> {
    return new Promise((resolve, reject) => {
      let payload = format.compact({
        light: [{
          power: 1
        }]
      })

      this.coap.put(deviceEndpoint + deviceId, payload).then(() => {
        resolve()
      }).catch((err) => {
        reject(err)
      })
    })
  }

  turnOff (deviceId: string): Promise<{}>  {
    return new Promise((resolve, reject) => {
      let payload = format.compact({
        light: [{
          power: 0
        }]
      })

      this.coap.put(deviceEndpoint + deviceId, payload).then(() => {
        resolve()
      }).catch((err) => {
        reject(err)
      })
    })
  }
}
