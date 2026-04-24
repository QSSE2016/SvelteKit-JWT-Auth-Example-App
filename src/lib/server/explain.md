# Web Security Basics (XSS / CSRF / Cookies)

Here, I'm going to explain some core web security concepts relevant to this app. If you are interested in learning more specific flows and the like, check out:

- OAuth 2.0
- OpenID Connect

They are both very well respected frameworks for security systems and are now the standard for serious (enterprise-level and more) applications. Oauth2.0 is an authorization (cross-domain specifically) framework whereas OpenID Connect (OIDC) is built on top of Oauth2.0 and it adds authentication to the mix.

_These are unrelated to the app and the rest of this document, but just saying it's worth learning even on a basic level since you will probably encounter them in the future._

---

## XSS (Cross-Site Scripting)

XSS is an attack where an attacker executes JS code in the victim’s browser within the context of a trusted website. Data can be stolen (DOM Content, API responses etc.), actions can be performed on the behalf of the actual user, UI can be changed (phishing inside the real site) etc.

### Something to Remember:

- **HttpOnly cookies cannot be accessed via JavaScript** (e.g. `document.cookie`)
- This means XSS cannot directly steal session cookies if they are HttpOnly
- However, XSS can still perform actions as the user (“session riding”)
  because the browser automatically includes cookies in requests

---

## CSRF (Cross-Site Request Forgery)

CSRF tricks a victim’s browser into sending an authenticated request to a site where the user is already logged in, without their intention. This works because, browsers automatically attach cookies to requests for a given domain.

Picture this:

- You are logged into `site1.com` (session cookie exists and isn't expired)
- You visit some other site: `site2.com` which is malicious and wants to send a request to site1.com
- `site2.com` sends request to `site1.com` (any request it really doesn't matter)
- Your browser auto includes the ` site1.com` cookies (**cookies are "per domain"** so they don't get wiped or anything of the sort)
- `site1.com` processes the request, sees the cookie is valid and permits the request.

**Bottom line is**, the attacker doesn't even need to read the cookie, the browser just sends the cookie automatically.

---

## Cookies and Domain Scope

Cookies are stored per **domain (and path)** and are not shared across domains. This means that:

- Cookies are not cleared when switching websites
- They persist until they expire or are manually cleared
- **They are only sent when the request matches the cookie's** domain.

_This context hopefully clears up some questions about the inner workings of CSRF_

---

## HttpOnly Cookies

HttpOnly cookies cannot be accessed via JavaScript (`document.cookie`). This protects against cookie theft via XSS (which works with JS, client-side). Though it's important to note that it doesn't nullify XSS entirely, just eliminates the very basic version of it. **Session riding is still possible.**

---

## Cookie Security Flags (Cookies API explanation)

### HttpOnly (Explained previously)

_Yeah nothing else to add honestly._

### Secure

- Client sends cookie back to the server only in HTTPS connections
- Prevents exposure over plaintext HTTP

### SameSite

Controls whether cookies are sent on cross-site requests.

#### Lax (default in SvelteKit)

- Blocks most cross-site POST requests
- Allows cookies on **top-level navigations** (e.g. clicking a link)
- Provides partial CSRF protection (not completely, more below)

_Some known ways to get around it:_

- Some top-level navigation tricks (opening links/windows)
  can still trigger cookie-sending requests
- Some browser features (prefetch/prerender) may also trigger requests

#### Strict

- Cookies are never sent on cross-site requests
- Strong protection against CSRF
- Can break some user flows (e.g. logging in via external links)

---

## General Flow

- User sends a POST request to login/sign-in
- Server confirms user is valid, generates a JWT and sends it back to the client
- Client now for every subsequent request sends that JWT (through a cookie) to the server
- Server verifies JWT signature and only then allows access to whatever the client is attempting to do/get

_So here, the JWT (Access Token) is responsible for both authentication and authorization_.

---

## Structure of a JWT Token

A well-formed **JWT** has 3 concatenated Base64url-encoded strings, separated by dots:

### 1. Header

This contains metadata about the type of token and the cryptographic algorithms used to secure its contents.

**JSON**

```
{
  "alg": "HS256",
  "typ": "JWT",
  "kid": "path/value" // optional
}
```

### 2. Payload

This contains "claims" or verifiable statements, such as the identity of the user and their specific permissions (basically important data that you might need).

**JSON**

```
{
  "username": "test@example.com",
  "id": "new user"
}
```

_In this app, I actually use "sub" for subject. It's another common way to write id and whatnot. Idk, it really doesn't matter I guess._

### 3. Signature

The signature is used to validate that the token is trustworthy and has not been tampered with. It is created by taking the encoded header, the encoded payload, **a secret**, and the algorithm specified in the header to sign the package.

The signature is generated using the following logic:

**JavaScript**

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

> **Note:** The secret key should always reside securely on the server side and never be exposed to the client. In this app it resides in the .env file in $lib/static/**private**

The final token is just the combination of all of these seperated by dots

### JWT Secret

For this one, you will generate it yourself and as mentioned before, make sure it's NOT accessible to the client. Ever. There are a few ways of going about it but the easiest way is to:

1. Open up a new terminal in VS Code (or wherever it doesn't really matter)
2. Type `node` to initiate a Node.js session or whatever its called
3. `require('crypto').randomBytes(64).toString('hex')`
4. Copy that string and paste it into the JWT_SECRET environment variable

And that's it, close the terminal since you don't need it. You might be wondering why 64 random bytes and it's because it's high entropy (512 bits) which means that it's really really hard to crack by brute force. It's the standard for stuff like this, the minimum, I believe is 32 bytes? so you would have 256 bits, which is still good but obviously not as good as 512.

_If you are implementing refresh tokens too, the exact same process will work for the refresh token secret._

---

## Refresh Tokens, How They Work And Why

The typical JWT token is called an **Access Token** and it typically expires from anywhere between 1-24 hours. It's fairly short lived by design and that's to reduce the chances of it being stolen by an attacker, who can then abuse it for its remaining lifetime.

The solution to the problem of long-lived vs short-lived is the **Refresh Token**. It's a long-lived token (typically days-weeks) and it's stored on the DB or on a HTTP-Only cookie, depending on your use case. For example if you need to revoke refresh tokens, then you should probably store them in a DB.

### Refresh Token Flow

1. User signs in
2. Server creates the access token (JWT, like before) but also a **refresh token. They are both stored on HTTP-Only Cookies.**
3. User sends access token as always and everything proceeds like the normal flow. However, **if the access token expires:**
4. Request now fails because of the invalid JWT and the client makes a request to an endpoint e.g `/refresh`
5. Server checks refresh token and if it's valid issues a new access token (without the user ever noticing)

Keep in mind, not every application needs refresh tokens. I will show them in this app, as well as what to leave out if you wish to have only access tokens (valid). Also refresh tokens don't necessarily mean that the app is safer, it's simply a matter of does it fit the app and does it improve user experience.

You store the refresh token either on an http-only cookie or database. By storing it in a cookie, it's still stateless auth, but you can choose to include a database for extra data or even the ability to revoke refresh tokens.
