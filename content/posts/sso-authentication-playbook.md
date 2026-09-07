---
title: "PixieShop Authentication Playbook — OIDC SSO Across Four Identity Providers"
date: 2026-03-21
description: "Practical OIDC SSO playbook for a Next.js B2B SaaS using Auth.js v5, FusionAuth, Okta, and Microsoft Entra ID."
tags:
  [
    sso,
    oidc,
    fusionauth,
    auth-js,
    okta,
    microsoft-entra,
    authentication,
    security,
  ]
---

> **Scenario.** PixieShop is a B2B SaaS that sells enchanted toys to retail partners. Every partner logs in through their own corporate identity provider — some use Okta, others use Microsoft Entra ID. We never see a password. FusionAuth sits in the middle as our OIDC identity broker, and Auth.js v5 handles the Next.js session on the frontend. This playbook is the single place where we document how the whole chain works, from RSA key creation to federated logout.

---

## 1. Architecture Overview — Who Talks to Whom

The authentication chain has four actors:

1. **Partner's browser** — opens PixieShop, clicks "Sign in with SSO."
2. **Auth.js v5** (Next.js) — redirects to FusionAuth with the right `idp_hint`.
3. **FusionAuth** (identity broker) — looks at the email domain, forwards to Okta or Entra ID.
4. **External IdP** (Okta or Entra ID) — authenticates the user, returns an authorization code.

The flow goes like this: Browser → Auth.js → FusionAuth → External IdP → FusionAuth → Auth.js → Browser. Every hop is a standard OIDC Authorization Code exchange. FusionAuth never stores passwords — it only stores the mapping between the external `sub` and our internal PixieShop user ID.

```

 Browser Auth.js FusionAuth Okta / Entra
 (Partner) (Next) (Broker) (Ext. IdP)

```

**Why a broker?** Without FusionAuth, Auth.js would need a separate provider config for every partner's IdP. With the broker, Auth.js talks to exactly one OIDC issuer. Adding a new partner IdP is a FusionAuth admin task — zero code changes.

---

## 2. FusionAuth — Tenant and RSA Key Setup

FusionAuth organises everything under Tenants. Each tenant has its own issuer URL, its own signing keys, and its own set of applications. For PixieShop we use a single tenant.

### 2.1 Configure the Tenant Issuer

Navigate to **FusionAuth Admin → Tenants → [PixieShop Tenant] → General Tab**.

Set the **Issuer** field to `https://auth.pixieshop.com` (include the `https://` — FusionAuth will reject a bare domain). Save, then verify by visiting `https://auth.pixieshop.com/.well-known/openid-configuration`. You should get back a JSON document with `issuer`, `jwks_uri`, `authorization_endpoint`, and friends.

### 2.2 Create RSA Signing Keys

Navigate to **Settings → Key Master → Add**.

Choose RSA, 2048-bit. Name it something recognisable like `PixieShop JWT Signing Key`. Save and note the Key ID — you will need it in the next step.

### 2.3 Assign Keys to the Tenant

Navigate to **Tenants → [PixieShop Tenant] → JWT Tab**.

Set both the **Access token signing key** and the **Id token signing key** to the RSA key you just created. Save. Verify by visiting `https://auth.pixieshop.com/.well-known/jwks.json` — you should see the public key in JWK format.

> **Why RSA and not HMAC?** External IdPs need to verify our tokens without sharing a secret. RSA gives us a public key we can expose at the JWKS endpoint. HMAC would require sharing the secret with every consumer.

---

## 3. FusionAuth — Application Configuration

An "Application" in FusionAuth maps to a client application — in our case, the PixieShop Next.js frontend.

### 3.1 Create the Application

Navigate to **Applications → Add**.

Name it `PixieShop Partner Dashboard`. Select the PixieShop tenant.

### 3.2 OAuth Settings

Open the **OAuth Tab** and configure:

**Authorized redirect URLs:**

```
http://localhost:3000/api/auth/callback/fusionauth
https://app.pixieshop.com/api/auth/callback/fusionauth
```

**Authorized origins (CORS):**

```
http://localhost:3000
https://app.pixieshop.com
```

**Logout URLs:**

```
http://localhost:3000/auth/logout
https://app.pixieshop.com/auth/logout
```

**Grants enabled:** Authorization Code and Refresh Token. Do not enable Implicit — it is deprecated in OAuth 2.1.

### 3.3 JWT Settings

Open the **JWT Tab**. **Uncheck** "Enabled" — let the application inherit JWT settings from the tenant level. This keeps signing keys in one place.

### 3.4 Roles (Optional)

Open the **Roles Tab**. Add `user` (default) and `admin`. Set `user` as the default role.

### 3.5 Note Your Credentials

From the OAuth Tab, copy the **Client ID** (UUID) and **Client Secret**. You will need both for Auth.js.

---

## 4. FusionAuth — Identity Provider (OIDC) Wiring

This is where we tell FusionAuth: "When you see an email from `@toyworld.com`, send them to Okta. When you see `@enchantedretail.onmicrosoft.com`, send them to Entra ID."

### 4.1 Add an OpenID Connect IdP (Okta Example)

Navigate to **Settings → Identity Providers → Add → OpenID Connect**.

Fill in:

| Field         | Value                                      |
| ------------- | ------------------------------------------ |
| Name          | `Okta — ToyWorld`                          |
| Client ID     | _(from Okta app registration)_             |
| Client Secret | _(from Okta app registration)_             |
| Issuer        | `https://toyworld.okta.com/oauth2/default` |
| Scope         | `openid email profile`                     |

### 4.2 Claims Mapping

| FusionAuth Field | Claim Value          |
| ---------------- | -------------------- |
| Unique Id claim  | `sub`                |
| Email claim      | `email`              |
| Username claim   | `preferred_username` |

> **Gotcha:** Do not use `email` as the username claim for Okta. The `preferred_username` claim is more reliable because Okta always populates it for OIDC apps, while `email` may be absent if the user profile is incomplete.

### 4.3 Managed Domains

Add `toyworld.com`. Any user whose email ends with `@toyworld.com` will be routed to this IdP automatically by FusionAuth's domain-based routing.

### 4.4 Application Enablement

Enable the IdP for the PixieShop Partner Dashboard application. Set **Create registration** to OFF — we handle user provisioning on our side.

Save and note the **Identity Provider ID** (UUID). Auth.js will pass this as `idp_hint` to skip the FusionAuth login screen.

### 4.5 Repeat for Entra ID

Same process, different values:

| Field           | Value                                                     |
| --------------- | --------------------------------------------------------- |
| Name            | `Microsoft — EnchantedRetail`                             |
| Client ID       | _(from Entra ID app registration)_                        |
| Client Secret   | _(from Entra ID — copy the secret **Value**, not the ID)_ |
| Issuer          | `https://login.microsoftonline.com/{tenantId}/v2.0`       |
| Scope           | `openid email profile`                                    |
| Managed domains | `enchantedretail.onmicrosoft.com`                         |

For Entra ID claims mapping, use `sub` or `oid` as the Unique Id claim, `email` as the Email claim, and `preferred_username` as the Username claim.

> **idp_hint is proprietary to FusionAuth.** It is not a standard OIDC parameter. It is the FusionAuth Identity Provider UUID, passed as a query parameter on the authorize endpoint to bypass the broker's login screen and jump straight to the external IdP.

---

## 5. Okta — OIDC Application and Authorization Server

### 5.1 Create the OIDC Application

In the **Okta Admin Console → Applications → Create App Integration**:

- Sign-in method: OIDC — OpenID Connect
- Application type: Web Application
- Name: `PixieShop SSO`
- Grant types: Authorization Code, Refresh Token
- Sign-in redirect URI: `https://auth.pixieshop.com/oauth2/callback`
- Sign-out redirect URI: `https://auth.pixieshop.com/oauth2/logout/callback`
- Controlled access: Limit to selected groups

Note the **Client ID**, **Client Secret**, and **Issuer** (`https://toyworld.okta.com/oauth2/default`).

### 5.2 Authorization Server Policy — The Step Everyone Forgets

This is the number one cause of Okta 400 errors. Without an access policy on the Authorization Server, Okta will reject every authorize request.

Navigate to **Security → API → Authorization Servers → default**.

> **Custom vs Org Authorization Server.** Okta has two types. The Org Authorization Server lives at `/oauth2/v1/*` and is meant for Okta's own APIs. The Custom Authorization Server (named `default`) lives at `/oauth2/default/v1/*` and is what you use for your own apps. **Always use the Custom (default) server for third-party OIDC integrations.** If you see endpoints like `https://toyworld.okta.com/oauth2/v1/authorize` without the `/default/` segment, you are hitting the Org server and things will break.

The correct endpoints are:

```
Authorization: https://toyworld.okta.com/oauth2/default/v1/authorize
Token: https://toyworld.okta.com/oauth2/default/v1/token
UserInfo: https://toyworld.okta.com/oauth2/default/v1/userinfo
```

**Create the access policy:**

1. Click **Access Policies → Add Policy**
2. Name: `PixieShop Integration Policy`
3. Assign to: the PixieShop SSO application

**Add a rule:**

- Rule Name: `Allow Assigned Users`
- Grant type: Authorization Code
- User is: Any user assigned the app
- Scopes: `openid`, `profile`, `email`
- Create Rule

Without this policy you will see either an HTTP 400 on the authorize endpoint (if the user is not yet authenticated at Okta) or a "You are not allowed to access this app" message (if the user is already authenticated).

### 5.3 Okta Plan Considerations

As of July 2025, Okta retired the Developer Edition org. The replacement is the **Integrator Free Plan**, which gives you a non-production org with up to 10 active users — enough for testing. Sign up at `developer.okta.com`. If you had a Developer Edition, you must migrate — your old org will be deactivated.

---

## 6. Microsoft Entra ID — App Registration and Token Claims

### 6.1 Register the Application

Navigate to **entra.microsoft.com → Identity → Applications → App registrations → New registration**.

> **Do not use the old "Azure Portal → Azure Active Directory" path.** Microsoft renamed Azure AD to Microsoft Entra ID in 2023 and has been migrating admin surfaces to `entra.microsoft.com`. The old Azure Portal path still works but is deprecated, and some new features only appear in the Entra admin center.

- Name: `PixieShop Partner SSO`
- Supported account types: Single tenant (EnchantedRetail's org only)
- Redirect URI: `https://auth.pixieshop.com/oauth2/callback`

### 6.2 Client Secret

Navigate to **Certificates & secrets → New client secret**. Copy the secret **Value** (not the ID column). The Value is only shown once.

### 6.3 Token Configuration — The Email Claim Breaking Change

This is critical. In **June 2023**, Microsoft changed the default behavior for the `email` claim in ID tokens. For multi-tenant apps, the `email` claim is no longer included unless the domain owner has verified it. Even for single-tenant apps, the `email` claim may be absent for users who do not have a mail attribute set in Entra ID.

Navigate to **Token configuration → Add optional claim → ID token** and select:

- `email`
- `preferred_username`
- `profile`

**For authorization decisions, never rely on `email` or `upn` as a stable identifier.** These are mutable — an admin can change a user's email at any time. Instead, use `oid` (Object ID) combined with `tid` (Tenant ID) as your immutable user identifier. The `sub` claim is also stable but is pairwise — it changes per application registration, so `oid` + `tid` is more portable if you ever need cross-app correlation.

### 6.4 Note Your Credentials

- Application (client) ID
- Directory (tenant) ID
- Client Secret Value
- Issuer: `https://login.microsoftonline.com/{tenantId}/v2.0`

Entra ID endpoints:

```
Authorization: https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize
Token: https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
UserInfo: https://graph.microsoft.com/oidc/userinfo
```

---

## 7. Auth.js v5 — Provider Setup

Auth.js v5 (the library formerly known as NextAuth.js) unifies everything into a single `auth()` function exported from a root `auth.ts` file. No more `getServerSession(req, res, authOptions)` — that is the v4 pattern.

### 7.1 The auth.ts Configuration

```ts
// auth.ts (project root)
import NextAuth from "next-auth";

const FusionAuthProvider = {
  id: "fusionauth",
  name: "FusionAuth",
  type: "oidc" as const,
  issuer: process.env.AUTH_FUSIONAUTH_ISSUER,
  clientId: process.env.AUTH_FUSIONAUTH_ID,
  clientSecret: process.env.AUTH_FUSIONAUTH_SECRET,
  authorization: {
    params: {
      scope: "openid profile email offline_access",
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [FusionAuthProvider],
  pages: { signIn: "/auth" },
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token;
        token.fusionAuthId = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.fusionAuthId as string;
      }
      return session;
    },
  },
});
```

> **Key v5 changes from v4:**
>
> - Environment variables use the `AUTH_` prefix: `AUTH_SECRET` (not `NEXTAUTH_SECRET`), `AUTH_URL` (not `NEXTAUTH_URL`). Auth.js v5 also infers `AUTH_URL` from request headers in many deployments, so you may not need to set it explicitly.
> - The provider field `clientId` maps to `AUTH_FUSIONAUTH_ID` (not `FUSIONAUTH_CLIENT_ID`). Auth.js v5 auto-reads `AUTH_{PROVIDER}_{FIELD}` env vars.
> - The `signIn()` function takes `redirectTo` (not `callbackUrl`).
> - The session cookie is named `authjs.session-token` (not `next-auth.session-token`).

### 7.2 Route Handler (App Router)

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### 7.3 Using auth() Everywhere

```ts
// In a Server Component
import { auth } from "@/auth";

export default async function DashboardPage() {
 const session = await auth();
 if (!session) redirect("/auth");
 return <h1>Welcome, {session.user?.name}</h1>;
}
```

```ts
// In Middleware
// middleware.ts (or proxy.ts in Next.js 16+)
import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/auth") {
    return Response.redirect(new URL("/auth", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

> **In Auth.js v5 middleware, the session is available on `req.auth`** — you do not need to call `getToken()` separately. The `getToken({ req })` pattern is v4-only.

---

## 8. Auth.js v5 — Email-Based IdP Routing (idp_hint)

When a partner types their email on the PixieShop login page, we extract the domain and pass the corresponding FusionAuth Identity Provider ID as `idp_hint`. This skips the FusionAuth login screen entirely and sends the user straight to their corporate IdP.

```tsx
// app/auth/components/EmailSSOForm.tsx
"use client";

import { signIn } from "next-auth/react";

const IDP_MAP: Record<string, string | undefined> = {
  "toyworld.com": process.env.NEXT_PUBLIC_OKTA_IDP_ID,
  "enchantedretail.onmicrosoft.com": process.env.NEXT_PUBLIC_ENTRA_IDP_ID,
};

export function EmailSSOForm() {
  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const domain = email.split("@")[1]?.toLowerCase();
    const idpId = domain ? IDP_MAP[domain] : undefined;

    await signIn(
      "fusionauth",
      { redirectTo: "/dashboard" },
      {
        login_hint: email,
        ...(idpId && { idp_hint: idpId }),
      },
    );
  }

  return (
    <form action={handleSubmit}>
      <label htmlFor="email">Work email</label>
      <input id="email" name="email" type="email" required />
      <button type="submit">Continue with SSO</button>
    </form>
  );
}
```

Notice we pass `redirectTo` (v5), not `callbackUrl` (v4). The third argument to `signIn()` contains additional authorization parameters that Auth.js forwards to FusionAuth.

---

## 9. FusionAuth — Theme Customization (Login Screen)

FusionAuth themes let you control the HTML/CSS of the login, error, and email templates. Theme customization requires a **paid plan** (Starter or above — the Community Edition does not support it).

> **Pricing clarification.** FusionAuth's paid tiers are Community (free, no theming), Starter, Essentials, and Enterprise. The old "Essentials" name you may see in some docs has been restructured — check `fusionauth.io/pricing` for the current breakdown.

### 9.1 Template Structure

FusionAuth uses **FreeMarker** as its template engine. The key templates are:

- **OAuth authorize** — the main login page
- **OAuth error** — the error page
- **Stylesheet** — shared CSS

### 9.2 FreeMarker Variables

The correct FreeMarker variables (some older docs get these wrong):

| Variable             | What it contains                      |
| -------------------- | ------------------------------------- |
| `${tenant.name!''}`  | Tenant display name                   |
| `${client_id!''}`    | OAuth client ID of the requesting app |
| `${loginId!''}`      | Pre-filled login identifier           |
| `${redirect_uri!''}` | Where to go after auth                |

> **Common mistake:** Using `${applicationName}` or `${action}` — these do not exist in FusionAuth's OAuth authorize template context. The application name is not directly available; use `${tenant.name}` or hard-code your app name. The form action URL is the current page URL, so use a regular `<form method="post">` without an explicit action attribute, or use FreeMarker's request helpers.

### 9.3 Email Prefill Script

Add this before `</body>` in the OAuth authorize template to pre-fill and lock the email field when `login_hint` is present:

```html
<script>
  (function () {
    var params = new URLSearchParams(window.location.search);
    var hint = params.get("login_hint");
    if (!hint) return;
    var el = document.getElementById("loginId");
    if (el) {
      el.value = hint;
      el.readOnly = true;
      el.setAttribute("tabindex", "-1");
    }
  })();
</script>
```

### 9.4 Styling for Design System Consistency

Keep the CSS simple. Use CSS custom properties so dark mode is a one-block override:

```css
:root {
  --ps-primary: #6c3fc5;
  --ps-bg: #faf8ff;
  --ps-text: #1a1a2e;
  --ps-border: #e0dce8;
  --ps-radius: 6px;
  --ps-font: "Inter", system-ui, sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ps-bg: #1a1a2e;
    --ps-text: #e8e6f0;
    --ps-border: #3a3650;
  }
}
```

The full CSS should match your product's design tokens. Include `font-size: 16px` on inputs to prevent iOS auto-zoom.

---

## 10. Federated Logout — Clearing Sessions Across All Layers

SSO logout is tricky because sessions exist in three places: the browser (Auth.js cookie), FusionAuth, and the external IdP. A proper federated logout clears all three.

### 10.1 The Logout Chain

1. User clicks "Sign out" in PixieShop.
2. Frontend calls our server-side logout action.
3. Server reads `id_token` from the Auth.js session.
4. Server redirects to FusionAuth's `/oauth2/logout` with `id_token_hint` and `post_logout_redirect_uri`.
5. FusionAuth clears its session and (if configured) sends a logout request to the external IdP.
6. FusionAuth redirects back to `post_logout_redirect_uri`.
7. Auth.js session cookie is cleared.

### 10.2 Server Action (App Router)

```ts
// app/auth/actions.ts
"use server";

import { auth, signOut } from "@/auth";

export async function federatedSignOut() {
  const session = await auth();
  const idToken = (session as any)?.idToken;

  if (!idToken) {
    // No id_token — just clear the local session
    await signOut({ redirectTo: "/auth" });
    return;
  }

  const logoutUrl = new URL(
    `${process.env.AUTH_FUSIONAUTH_ISSUER}/oauth2/logout`,
  );
  logoutUrl.searchParams.set("id_token_hint", idToken);
  logoutUrl.searchParams.set(
    "post_logout_redirect_uri",
    `${process.env.AUTH_URL}/auth/logout`,
  );

  // Clear Auth.js session first, then redirect to FusionAuth logout
  await signOut({ redirect: false });
  redirect(logoutUrl.toString());
}
```

> **Why not `res.redirect()`?** In Auth.js v5 with the App Router, we do not have access to the raw `res` object. Use Next.js `redirect()` from `next/navigation` for server actions, or return a redirect Response from a Route Handler.

### 10.3 Logout Landing Page

```tsx
// app/auth/logout/page.tsx
import { signOut } from "@/auth";

export default async function LogoutPage() {
  // This page is the post_logout_redirect_uri target.
  // Auth.js session should already be cleared, but just in case:
  await signOut({ redirect: false });
  return (
    <div>
      <h1>You have been signed out</h1>
      <a href="/auth">Sign in again</a>
    </div>
  );
}
```

### 10.4 Critical: Logout URL Must Match

The `post_logout_redirect_uri` you pass to FusionAuth **must exactly match** one of the "Logout URLs" configured in the FusionAuth application OAuth settings. A trailing slash mismatch will cause FusionAuth to silently ignore the redirect and show its own generic logged-out page.

---

## 11. Role-Based Routing and Database Linking

### 11.1 Linking FusionAuth Users to PixieShop Users

When a partner logs in via SSO for the first time, we need to connect their FusionAuth identity to their PixieShop database record. We use a `fusionAuthId` column:

```sql
ALTER TABLE "user" ADD COLUMN "fusionAuthId" VARCHAR UNIQUE;
CREATE INDEX idx_user_fusion_auth_id ON "user"("fusionAuthId");
```

The linking happens lazily on first SSO login:

```ts
// lib/auth/link-user.ts
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function linkOrCreateUser(email: string, fusionAuthId: string) {
  // Try to find by fusionAuthId first (returning user)
  let existing = await db.query.user.findFirst({
    where: eq(user.fusionAuthId, fusionAuthId),
  });

  if (existing) return existing;

  // Try to find by email (first-time SSO)
  existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (existing) {
    await db.update(user).set({ fusionAuthId }).where(eq(user.id, existing.id));
    return { ...existing, fusionAuthId };
  }

  // JIT provisioning: create new user
  const [newUser] = await db
    .insert(user)
    .values({ email, fusionAuthId })
    .returning();

  return newUser;
}
```

### 11.2 Role-Based Middleware

```ts
// middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL("/auth", req.nextUrl));
  }

  // Admin routes require admin role
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const roles = (req.auth as any).roles ?? [];
    if (!roles.includes("admin")) {
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

### 11.3 Injecting Roles into the Session

FusionAuth includes roles in the ID token under the `roles` claim (if you configured roles on the application). Capture them in the JWT callback:

```ts
// auth.ts — extend the jwt callback
callbacks: {
 jwt({ token, account, profile }) {
 if (account) {
 token.idToken = account.id_token;
 token.fusionAuthId = account.providerAccountId;
 token.roles = (profile as any)?.roles ?? [];
 }
 return token;
 },
 session({ session, token }) {
 if (session.user) {
 session.user.id = token.fusionAuthId as string;
 (session as any).roles = token.roles;
 }
 return session;
 },
},
```

> **Do not decode the `id_token` manually on the client.** The old pattern of `import jwt_decode from "jwt-decode"` (default import) is wrong — `jwt-decode` v4 uses named exports: `import { jwtDecode } from "jwt-decode"`. But more importantly, you should not need it. Auth.js already decodes the token and gives you the claims in the `profile` parameter of the `jwt` callback. Let the server handle tokens; the client gets the session object.

---

## 12. Environment Variables — Complete Reference

```bash
# Auth.js v5
AUTH_SECRET="openssl rand -base64 33" # generate with this command
AUTH_URL=https://app.pixieshop.com # optional in Vercel/auto-detected

# FusionAuth (Auth.js provider)
AUTH_FUSIONAUTH_ISSUER=https://auth.pixieshop.com
AUTH_FUSIONAUTH_ID=<fusionauth-client-id>
AUTH_FUSIONAUTH_SECRET=<fusionauth-client-secret>

# IdP Routing (public, safe for browser)
NEXT_PUBLIC_OKTA_IDP_ID=<fusionauth-okta-identity-provider-uuid>
NEXT_PUBLIC_ENTRA_IDP_ID=<fusionauth-entra-identity-provider-uuid>

# Domain Mapping (server-side only)
OKTA_MANAGED_DOMAINS=toyworld.com
ENTRA_MANAGED_DOMAINS=enchantedretail.onmicrosoft.com
```

> **Auth.js v5 naming convention.** Provider-specific env vars follow the pattern `AUTH_{PROVIDER_ID}_{FIELD}`. Auth.js reads them automatically, so you can omit `clientId` and `clientSecret` from the provider object if you name your env vars correctly. We keep them explicit in the config for clarity.

---

## 13. Troubleshooting — Error Patterns and Fixes

### `jwks_uri must be configured`

**Cause:** RSA keys were not assigned to the tenant's JWT settings.

**Fix:** Tenants → JWT Tab → set both signing keys → restart Next.js to flush the OIDC discovery cache.

### `invalid_redirect_uri`

**Cause:** The callback URL Auth.js sends does not exactly match what is registered in FusionAuth.

**Fix:** Check Applications → OAuth Tab → "Authorized redirect URLs". The URL must be an exact match — no trailing slash differences, no http vs https mismatch.

### `invalid_client`

**Cause:** Client ID or Client Secret mismatch.

**Fix:** Re-copy both from FusionAuth Applications → General Tab. Update `.env.local` and restart.

### Okta 400 on `/authorize`

**Cause:** No access policy on the Okta Custom Authorization Server for your client.

**Fix:** Security → API → Authorization Servers → `default` → Access Policies. Create a policy bound to your app with a rule allowing Authorization Code grants. See section 5.2.

### Okta "You are not allowed to access this app"

**Cause:** Same as above — the user is already authenticated at Okta but there is no policy allowing the token grant.

### Entra ID missing `email` claim

**Cause:** The June 2023 breaking change. Multi-tenant apps no longer receive `email` by default.

**Fix:** Token configuration → Add optional claim → ID token → select `email`. For single-tenant apps this usually works. For multi-tenant apps, the email domain must be verified by the tenant admin.

### Entra ID `invalid_client`

**Cause:** Copied the secret **ID** instead of the secret **Value** from Certificates & secrets.

**Fix:** Go back to Entra → Certificates & secrets. If you can no longer see the Value, create a new secret — the Value is only shown once at creation time.

### Auth.js session cookie not set

**Cause:** Possibly using the old cookie name `next-auth.session-token` in your checks. Auth.js v5 uses `authjs.session-token`.

**Fix:** Update any cookie-reading code. In most cases, use `auth()` server-side — do not read cookies directly.

### `import type { } = from "next"` syntax error

**Cause:** A TypeScript typo — the `=` sign does not belong there.

**Fix:** The correct syntax is `import type { NextApiRequest, NextApiResponse } from "next"` (no `=`).

---

## 14. Testing Checklist

### Happy Path

- [ ] Partner with Okta-managed domain signs in → redirected to Okta → returns to PixieShop dashboard
- [ ] Partner with Entra-managed domain signs in → redirected to Entra → returns to PixieShop dashboard
- [ ] Email prefill: login_hint populates and locks the email field on FusionAuth login screen
- [ ] First-time user: `fusionAuthId` column gets populated in the database
- [ ] Returning user: login succeeds without re-linking

### Federated Logout

- [ ] Click logout → FusionAuth session cleared → Auth.js cookie cleared → user sees logged-out page
- [ ] `post_logout_redirect_uri` matches FusionAuth "Logout URL" exactly
- [ ] After logout, visiting `/dashboard` redirects to `/auth`
- [ ] Invalid `id_token_hint` on logout → graceful fallback to local session cleanup

### Role-Based Access

- [ ] Admin user navigates to `/admin` → access granted
- [ ] Non-admin user navigates to `/admin` → redirected to `/dashboard`
- [ ] Role change in database → reflected on next login

### Edge Cases

- [ ] User's email domain changes in Entra → still accessible via `fusionAuthId` / `oid`
- [ ] FusionAuth session expires but Auth.js cookie is still valid → next request triggers re-auth
- [ ] IdP is down → Auth.js shows a meaningful error, not a blank page
- [ ] Two partners with the same email prefix but different domains → correctly routed to different IdPs

---

## 15. Production Pre-Flight

- [ ] FusionAuth Logout URL matches `${AUTH_URL}/auth/logout` exactly
- [ ] FusionAuth redirect URL matches `${AUTH_URL}/api/auth/callback/fusionauth` exactly
- [ ] `AUTH_SECRET` is a strong random value (32+ bytes), rotated quarterly
- [ ] `AUTH_URL` is set to the production domain (or verified to auto-detect correctly)
- [ ] Database migration for `fusionAuthId` column is deployed
- [ ] Okta access policy is created and bound to the correct application
- [ ] Entra ID optional claims (`email`, `preferred_username`) are configured
- [ ] CORS origins in FusionAuth include the production domain
- [ ] TLS certificates are valid for `auth.pixieshop.com`
- [ ] Monitoring: track failed logins, logout errors, `fusionAuthId` linking rate

---

## 16. Self-Verification Audit

This section lists every correction applied when consolidating the four source documents into this playbook. If you are reviewing this note, check each item to confirm the fix is present.

| #   | Source File          | Original Error                                                             | Fix Applied                                                                                                                                                          |
| --- | -------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | fusionauth-sso-setup | Used `NEXTAUTH_SECRET` / `NEXTAUTH_URL`                                    | Changed to `AUTH_SECRET` / `AUTH_URL` (Auth.js v5)                                                                                                                   |
| 2   | fusionauth-sso-setup | Used `callbackUrl` in `signIn()`                                           | Changed to `redirectTo` (Auth.js v5)                                                                                                                                 |
| 3   | fusionauth-sso-setup | Provider type set to `"oauth"`                                             | Changed to `"oidc"` (FusionAuth supports OIDC discovery)                                                                                                             |
| 4   | fusionauth-sso-setup | Used `FUSIONAUTH_CLIENT_ID` / `FUSIONAUTH_CLIENT_SECRET` env vars          | Changed to `AUTH_FUSIONAUTH_ID` / `AUTH_FUSIONAUTH_SECRET` (v5 convention)                                                                                           |
| 5   | fusionauth-sso-setup | Company domain `attend.tech` in IdP routing                                | Changed to `toyworld.com` (PixieShop scenario)                                                                                                                       |
| 6   | fusionauth-theme     | FreeMarker variable `${applicationName}`                                   | Corrected: this variable does not exist in OAuth authorize context. Use `${tenant.name}` or hard-code                                                                |
| 7   | fusionauth-theme     | FreeMarker variable `${action}` in form action                             | Corrected: use default form POST behavior or FreeMarker request helpers                                                                                              |
| 8   | fusionauth-theme     | Pricing table listed "Essentials" as first paid tier                       | Corrected: current tiers are Community (free), Starter, Essentials, Enterprise                                                                                       |
| 9   | okta-oidc            | Endpoints used `/oauth2/v1/*` (Org server)                                 | Corrected to `/oauth2/default/v1/*` (Custom Authorization Server)                                                                                                    |
| 10  | okta-oidc            | Navigated to "Azure Portal → Entra ID"                                     | Corrected to `entra.microsoft.com` (modern admin center)                                                                                                             |
| 11  | okta-oidc            | `import type { } = from "next"` syntax error                               | Corrected: removed erroneous `=`                                                                                                                                     |
| 12  | okta-oidc            | Username claim set to `email` for Okta                                     | Corrected to `preferred_username` (more reliable)                                                                                                                    |
| 13  | okta-oidc            | Company name `Attend` throughout                                           | Changed to PixieShop / ToyWorld / EnchantedRetail                                                                                                                    |
| 14  | sso-nextauth         | Used `getServerSession(req, res, authOptions)` (v4)                        | Changed to `auth()` (Auth.js v5 universal function)                                                                                                                  |
| 15  | sso-nextauth         | Used `getToken({ req })` in middleware                                     | Removed: in v5, use `req.auth` directly in the auth middleware wrapper                                                                                               |
| 16  | sso-nextauth         | Used `callbackUrl` parameter                                               | Changed to `redirectTo`                                                                                                                                              |
| 17  | sso-nextauth         | Used `NEXTAUTH_SECRET` / `NEXTAUTH_URL` env vars                           | Changed to `AUTH_SECRET` / `AUTH_URL`                                                                                                                                |
| 18  | sso-nextauth         | Used `jwt_decode` default import                                           | Corrected: `jwt-decode` v4 uses named export `{ jwtDecode }`. But we removed client-side token decoding entirely — roles come from the `profile` in the jwt callback |
| 19  | sso-nextauth         | Used `fetch() + res.redirect()` for federated logout                       | Replaced with Next.js `redirect()` in server actions (App Router pattern)                                                                                            |
| 20  | sso-nextauth         | Cookie name `next-auth.session-token`                                      | Corrected to `authjs.session-token` (Auth.js v5)                                                                                                                     |
| 21  | sso-nextauth         | Pages Router API route pattern (`pages/api/auth/...`)                      | Updated to App Router pattern (`app/api/auth/[...nextauth]/route.ts`)                                                                                                |
| 22  | okta-oidc            | No mention of Okta Integrator Free Plan                                    | Added: Developer Edition retired July 2025, replaced by Integrator Free Plan                                                                                         |
| 23  | okta-oidc            | No mention of Entra email claim June 2023 change                           | Added: email claim breaking change, use `oid` + `tid` for authorization                                                                                              |
| 24  | fusionauth-sso-setup | Provider import `from "next-auth/providers/fusionauth"`                    | Changed to inline object definition with `type: "oidc"` and `issuer` (Auth.js v5 generic OIDC)                                                                       |
| 25  | sso-nextauth         | `export { handler as GET, handler as POST }` from Pages Router file        | Updated to App Router `export const { GET, POST } = handlers` pattern                                                                                                |
| 26  | all files            | Company name "Attend" / domain "attend.tech" throughout                    | Replaced with PixieShop / ToyWorld / EnchantedRetail fictional scenario                                                                                              |
| 27  | all files            | `type: rampup` / `company: Attend` in frontmatter                          | Removed company-specific metadata                                                                                                                                    |
| 28  | fusionauth-theme     | Described `${error_code}` in error template                                | Corrected: the actual FreeMarker variable is `${errorCode!''}` (camelCase)                                                                                           |
| 29  | sso-nextauth         | `idp_hint` described without noting it is FusionAuth-proprietary           | Added explicit note that `idp_hint` is not a standard OIDC parameter                                                                                                 |
| 30  | okta-oidc            | Entra secret instructions say "copy Value (not the ID)" but no explanation | Added: the Value is only shown once at creation time; if you miss it, create a new secret                                                                            |

---
