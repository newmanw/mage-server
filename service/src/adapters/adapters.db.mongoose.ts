import mongoose from 'mongoose'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const log = require('winston')

class RetryConnection {

  readonly connectTimeout: number

  /**
   *
   * @param totalRetryTime the total number of milliseconds to retry connections before failing
   * @param retryInterval the number of milliseconds to wait between connection retries
   * @param resolve
   * @param reject
   */
  constructor(
    readonly uri: string,
    totalRetryTime: number,
    readonly retryInterval: number,
    readonly options: mongoose.ConnectionOptions,
    readonly resolve: (conn: mongoose.Mongoose) => any,
    readonly reject: (err: any) => any) {
    this.connectTimeout = Date.now() + totalRetryTime;
  }

  attemptConnection(): Promise<mongoose.Mongoose> {
    return mongoose.connect(this.uri, this.options).then(() => this.resolve(mongoose), this.onConnectionError.bind(this));
  }

  onConnectionError(err: any): void {
    log.error(`error connecting to mongodb database at ${this.uri}; please make sure mongodb is running: ${!!err ? err : 'unknown error'}`);
    if (Date.now() < this.connectTimeout) {
      log.info(`will retry connection in ${this.retryInterval / 1000} seconds`);
      setTimeout(this.attemptConnection.bind(this), this.retryInterval);
    }
    else {
      this.reject(`timed out after ${this.connectTimeout / 1000} seconds waiting for mongodb connection`);
    }
  }
}

export const waitForDefaultMongooseConnection = (uri: string, retryTotalTime: number, retryInterval: number, options: mongoose.ConnectionOptions): Promise<mongoose.Mongoose> => {
  if (mongoose.connection.readyState === mongoose.STATES.connected) {
    return Promise.resolve(mongoose)
  }
  return new Promise<mongoose.Mongoose>((resolve, reject) => {
    const retries = new RetryConnection(uri, retryTotalTime, retryInterval, options, resolve, reject)
    retries.attemptConnection()
  })
};