export default class XHRHttpStack {
  createRequest(method, url) {
    return new Request(method, url)
  }

  getName() {
    return 'FetchHttpStack'
  }
}

class StatusStream extends TransformStream {
  constructor(progressHandler) {
    this.progressHandler = progressHandler
    this._progress = 0
  }
  
  updateProgress(val) {
    if (this.progressHandler) {
      this._progress += val
      this.progressHandler(this._progress)
    } else {
      console.log('Progress:', this._progress)
    }
  }

  start() {
    this.updateProgress(0)
  }
  async transform(chunk, controller) {
    this.updateProgress(chunk.length)
    controller.enqueue(chunk)
  }
  flush() {
  }
}

class Request {
  constructor(method, url) {
    this._method = method
    this._url = url
    this._headers = {}
    this._progressHandler = null
    this._progress = 0
  }

  getMethod() {
    return this._method
  }

  getURL() {
    return this._url
  }

  setHeader(header, value) {
    this._headers[header] = value
  }

  getHeader(header) {
    return this._headers[header]
  }

  setProgressHandler(progressHandler) {
    this._progressHandler = progressHandler
  }

  async send(body = null) {
    let rs = null;
    const rsp = await fetch(this._url, {
      method: this._method,
      headers: this._headers,
      body: body
    })
    if(rsp.status in [200, 201, 202, 204, 206]) {
      this._progress += body?.length || 0
    }

    if(this._progressHandler){
      this._progressHandler(this._progress)
    }
    return new Response(rsp);
  }

  abort() {
    this._xhr.abort()
    return Promise.resolve()
  }

  getUnderlyingObject() {
    return this._xhr
  }
}

class Response {
  constructor(rsp) {
    this.rsp = rsp
  }

  getStatus() {
    return this.rsp.status
  }

  getHeader(header) {
    return this.rsp.headers.get(header)
  }

  getBody() {
    return this.rsp.text()
  }

  getUnderlyingObject() {
    return this.rsp
  }
}
