/**
 * Very simplistic map implementation for building a set of HTTP headers, which
 * can be returned as part of the HTTP response.
 *
 * This implementation, could be flushed out to be a more useful and complete
 * implementaiton. At this point I don't see a need yet.
 *
 * @author swallace
 */
export class Headers {

  headers: Map<string, string> = new Map<string, string>();

  /**
   * Appends a new key/value pair to the map.
   */
  append(name: string, value: string): Headers {
    this.headers.set(name, value);
    return this;
  }

  /**
   * Helper for commonly-added location header, to
   * avoid risk of typos in callers.
   */
  appendLocation(location: string): Headers {
    this.append('Location', location);
    return this;
  }

  /**
   * Converts the map to JSON.
   */
  public toJSON(): ILambdaProxyResultHeaders {
    const obj = {};

    for (const key of Array.from(this.headers.keys())) {
      obj[String(key)] = this.headers.get(key);
    }

    return obj;
  }

  /**
   * Returns header used to add access control to response.
   */
  public accessControlHeader(): Headers {
    this.append('Access-Control-Allow-Origin', '*');
    this.append('Access-Control-Allow-Credentials', 'true');
    this.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
    this.append('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    return this;
  }
}

export interface ILambdaProxyResultHeaders {
      [header: string]: boolean | number | string;
  }
