import { CloudflareSocket as BaseCloudflareSocket } from 'cf-mongodb-polyfills';

type Sink = {
  write?: (value: Uint8Array) => unknown;
  _write?: (value: Uint8Array, encoding: string, callback: () => void) => unknown;
  emit?: (event: string, value: Uint8Array) => unknown;
};

// The package polyfill's stream bridge assumes every destination exposes
// Writable.write(). Cloudflare's bundled stream shim can expose _write() only,
// so normalize both shapes before passing MongoDB wire data downstream.
class CloudflareSocket extends BaseCloudflareSocket {
  async listenForMongoData() {
    const socket = this as unknown as {
      _cfReader: ReadableStreamDefaultReader<Uint8Array>;
      sinks: Set<Sink>;
    };
    while (true) {
      const { done, value } = await socket._cfReader.read();
      if (done) break;
      for (const sink of socket.sinks) {
        if (typeof sink.write === 'function') sink.write(value);
        else if (typeof sink._write === 'function') sink._write(value, 'buffer', () => undefined);
        else sink.emit?.('data', value);
      }
    }
  }

  connect(options: Parameters<BaseCloudflareSocket['connect']>[0], listener?: () => void) {
    const result = super.connect(options, listener);
    const socket = this as unknown as { _listen: () => Promise<void> };
    socket._listen = () => this.listenForMongoData();
    return result;
  }
}

export const createConnection = (options: Parameters<CloudflareSocket['connect']>[0]) => {
  const socket = new CloudflareSocket(false);
  socket.connect(options);
  return socket;
};

export const connect = (options: Parameters<CloudflareSocket['connect']>[0]) => {
  const socket = new CloudflareSocket(true);
  socket.connect(options);
  return socket;
};

export const isIP = (host: string) => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);

export default { createConnection, isIP };
