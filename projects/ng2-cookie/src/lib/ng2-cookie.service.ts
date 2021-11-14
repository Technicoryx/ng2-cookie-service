import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class Ng2CookieService {
  private readonly documentIsAccessible: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    // Get the `PLATFORM_ID` so we can check if we're in a browser.
    @Inject(PLATFORM_ID) private platformId : any
  ) {
    this.documentIsAccessible = isPlatformBrowser(this.platformId);
  }

  /**
   * Get cookie Regular Expression
   *
   * @param name Cookie name
   * @returns property RegExp
   *
   * @author: Debabrata Dash
   * @since: 1.0.0
   */
  private static getCookieRegExp(name: string): RegExp {
    const escapedName: string = name.replace(/([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/gi, '\\$1');

    return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g');
  }

  /**
   * Gets the unencoded version of an encoded component of a Uniform Resource Identifier (URI).
   *
   * @param encodedURIComponent A value representing an encoded URI component.
   *
   * @returns The unencoded version of an encoded component of a Uniform Resource Identifier (URI).
   *
   * @author: Debabrata Dash
   * @since: 1.0.0
   */
   private static safeDecodeURIComponent(encodedURIComponent: string): string {
    try {
      return decodeURIComponent(encodedURIComponent);
    } catch {
      // probably it is not uri encoded. return as is
      return encodedURIComponent;
    }
  }

  /**
   * Return `true` if {@link Document} is accessible, otherwise return `false`
   *
   * @param name Cookie name
   * @returns boolean - whether cookie with specified name exists
   *
   * @author: Debabrata Dash
   * @since: 1.0.0
   */
  check(name: string): boolean {
    if (!this.documentIsAccessible) {
      return false;
    }
    name = encodeURIComponent(name);
    const regExp: RegExp = Ng2CookieService.getCookieRegExp(name);
    return regExp.test(this.document.cookie);
  }

  /**
   * Get cookies by name
   *
   * @param name Cookie name
   * @returns property value
   *
   * @author: Debabrata Dash
   * @since: 1.0.0
   */
   get(name: string): string {
    if (this.documentIsAccessible && this.check(name)) {
      name = encodeURIComponent(name);

      const regExp: RegExp = Ng2CookieService.getCookieRegExp(name);
      const result: RegExpExecArray = regExp.exec(this.document.cookie);

      return result[1] ? Ng2CookieService.safeDecodeURIComponent(result[1]) : '';
    } else {
      return '';
    }
  }

  /**
   * Get all cookies in JSON format
   *
   * @returns all the cookies in json
   *
   * @author: Debabrata Dash
   * @since: 1.0.0
   */
  getAll(): { [key: string]: string } {
    if (!this.documentIsAccessible) {
      return {};
    }

    const cookies: { [key: string]: string } = {};
    const document: any = this.document;

    if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach((currentCookie) => {
        const [cookieName, cookieValue] = currentCookie.split('=');
        cookies[Ng2CookieService.safeDecodeURIComponent(cookieName.replace(/^ /, ''))] = Ng2CookieService.safeDecodeURIComponent(cookieValue);
      });
    }

    return cookies;
  }

   /**
   * Set cookie based on provided information
   *
   * @param name     Cookie name
   * @param value    Cookie value
   * @param expires  Number of days until the cookies expires or an actual `Date`
   * @param path     Cookie path
   * @param domain   Cookie domain
   * @param secure   Secure flag
   * @param sameSite OWASP samesite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   *
   * @author: Debabrata Dash
   * @since: 1.0.0
   */
    set(name: string, value: string, expires?: number | Date, path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict'): void;

    /**
     * Set cookie based on provided information
     *
     * Cookie's parameters:
     * <pre>
     * expires  Number of days until the cookies expires or an actual `Date`
     * path     Cookie path
     * domain   Cookie domain
     * secure   Secure flag
     * sameSite OWASP samesite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
     * </pre>
     *
     * @param name     Cookie name
     * @param value    Cookie value
     * @param options  Body with cookie's params
     *
     * @author: Debabrata Dash
     * @since: 1.0.0
     */
    set(
      name: string,
      value: string,
      options?: {
        expires?: number | Date;
        path?: string;
        domain?: string;
        secure?: boolean;
        sameSite?: 'Lax' | 'None' | 'Strict';
      }
    ): void;
  
    set(
      name: string,
      value: string,
      expiresOrOptions?: number | Date | any,
      path?: string,
      domain?: string,
      secure?: boolean,
      sameSite?: 'Lax' | 'None' | 'Strict'
    ): void {
      if (!this.documentIsAccessible) {
        return;
      }
  
      if (typeof expiresOrOptions === 'number' || expiresOrOptions instanceof Date || path || domain || secure || sameSite) {
        const optionsBody = {
          expires: expiresOrOptions,
          path,
          domain,
          secure,
          sameSite: sameSite ? sameSite : 'Lax',
        };
  
        this.set(name, value, optionsBody);
        return;
      }
  
      let cookieString: string = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';
  
      const options = expiresOrOptions ? expiresOrOptions : {};
  
      if (options.expires) {
        if (typeof options.expires === 'number') {
          const dateExpires: Date = new Date(new Date().getTime() + options.expires * 1000 * 60 * 60 * 24);
  
          cookieString += 'expires=' + dateExpires.toUTCString() + ';';
        } else {
          cookieString += 'expires=' + options.expires.toUTCString() + ';';
        }
      }
  
      if (options.path) {
        cookieString += 'path=' + options.path + ';';
      }
  
      if (options.domain) {
        cookieString += 'domain=' + options.domain + ';';
      }
  
      if (options.secure === false && options.sameSite === 'None') {
        options.secure = true;
        console.warn(
          `[ngx-cookie-service] Cookie ${name} was forced with secure flag because sameSite=None.` +
            `More details : https://github.com/Technicoryx/ng2-cookie-service`
        );
      }
      if (options.secure) {
        cookieString += 'secure;';
      }
  
      if (!options.sameSite) {
        options.sameSite = 'Lax';
      }
  
      cookieString += 'sameSite=' + options.sameSite + ';';
  
      this.document.cookie = cookieString;
    }
  
    /**
     * Delete cookie by name
     *
     * @param name   Cookie name
     * @param path   Cookie path
     * @param domain Cookie domain
     * @param secure Cookie secure flag
     * @param sameSite Cookie sameSite flag - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
     *
     * @author: Debabrata Dash
     * @since: 1.0.0
     */
    delete(name: string, path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
      if (!this.documentIsAccessible) {
        return;
      }
      const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
      this.set(name, '', { expires: expiresDate, path, domain, secure, sameSite });
    }
  
    /**
     * Delete all cookies
     *
     * @param path   Cookie path
     * @param domain Cookie domain
     * @param secure Is the Cookie secure
     * @param sameSite Is the cookie same site
     *
     * @author: Debabrata Dash
     * @since: 1.0.0
     */
    deleteAll(path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
      if (!this.documentIsAccessible) {
        return;
      }
  
      const cookies: any = this.getAll();
  
      for (const cookieName in cookies) {
        if (cookies.hasOwnProperty(cookieName)) {
          this.delete(cookieName, path, domain, secure, sameSite);
        }
      }
    }

}