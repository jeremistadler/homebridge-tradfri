'use strict'

import * as os from 'os'; 
import * as util from 'util'; 
import { exec, spawn } from 'child_process';
import { Queue } from 'promise-queue';

let queue = new Queue(1, Infinity)

export module COAP {
  export class Client {
    log: (format: string, message: any) => void;
    hostname: string;
    port: string;
    psk: string;
    binary: string;

    constructor (log, hostname, port, psk) {
      this.log = log
      this.hostname = hostname
      this.port = port
      this.psk = psk
      this.binary = 'bin/coap-client-' + os.platform()
    }

    get (uri) {
      return queue.add(() => {
        return new Promise((resolve, reject) => {
          const endpoint = util.format('coaps://%s:%s%s',
            this.hostname, this.port, uri)

          this.log('GET:', endpoint)

          const cmd = util.format("%s -u 'Client_identity' -k %s %s -o -",
            this.binary, this.psk, endpoint)

          exec(cmd, (error, stdout, stderr) => {
            if (error) {
              reject(error)
            }

            let split = stdout.split('\n')
            split = split.filter((line) => line !== '')
            resolve(split.pop())
          })
        })
      })
    }

    put (uri, payload) {
      return queue.add(() => {
        return new Promise((resolve, reject) => {
          const endpoint = util.format('coaps://%s:%s%s',
            this.hostname, this.port, uri)

          this.log('PUT:', endpoint)

          const cmd = spawn(this.binary, ['-f', '-', '-u', 'Client_identity',
            '-k', this.psk, '-m', 'put', endpoint
          ])

          cmd.stdin.write(JSON.stringify(payload))
          cmd.stdin.end()

          cmd.stderr.on('data', (data) => reject(data))
          cmd.on('close', (code) => resolve(code))
        })
      })
    }
  } 
}