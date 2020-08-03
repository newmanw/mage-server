import axios from 'axios'
import { URL } from 'url'
import { MsiTransport, MsiRequest, MsiResponse } from './nga-msi'

export class AxiosMsiTransport implements MsiTransport {

  async send(req: MsiRequest, baseUrl: URL): Promise<MsiResponse> {

    const fullUrl = new URL(req.path, baseUrl)
    // for (const pair of Object.entries(req.queryParams || {})) {
    //   if (pair[1] instanceof Array) {
    //     for (const item of pair[1]) {
    //       fullUrl.searchParams.append(pair[0], item)
    //     }
    //   }
    //   else {
    //     fullUrl.searchParams.append(pair[0], pair[1] as string)
    //   }
    // }
    if (req.method === 'get') {
      const res = await axios.get(fullUrl.toString(), { params: req.queryParams })
      return {
        status: res.status,
        body: res.data
      }
    }
    throw new Error('only get is supported')
  }
}