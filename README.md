# Tradfri Node Library

IKEA Trådfri Gateway

## Features
- Automatic discovery of the Trådfri gateway
- Turn on/off lights
- Adjust the brightness

## Installation

2. Install this plugin using: `npm install`
3. Update your configuration file. See the sample below.

## Sample Configuration

The PSK (Pre-Shared Key) can be found printed on the bottom of the IKEA Trådfri Gateway.
This plugin makes use of coap-client which is part of libcoap.

The plugin comes with prebuilt x86-64 binaries for macOS and Linux. There is no need to compile ```coap-client``` if this is what you're using. If not, you'll need to compile ```coap-client``` yourself and use the config property ```coapClientPath``` to point to the location of the ```coap-client``` binary.
```js
"platforms": [{
    "platform" : "Tradfri",
    "name" : "Tradfri",
    "psk" : "23asqw9123j33",
    "coapClientPath": "/usr/local/bin/coap-client" // OPTIONAL: See above
}],
```

## Compiling libcoap
Installing [libcoap](https://github.com/obgm/libcoap) as per the following instructions for Debian/Ubuntu:
```shell
$ apt-get install libtool git build-essential autoconf automake
$ git clone --recursive https://github.com/obgm/libcoap.git
$ cd libcoap
$ git checkout dtls
$ git submodule update --init --recursive
$ ./autogen.sh
$ ./configure --disable-documentation --disable-shared
$ make
$ sudo make install
```

You'll find the ```coap-client``` binary in ```./examples```

## Credits
Big thanks to everyone discussing Trådfri in this issue: https://github.com/bwssytems/ha-bridge/issues/570
