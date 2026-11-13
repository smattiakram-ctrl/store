// NABIL Store — Cloudflare Worker API (D1 + R2)
// Security model:
//  - Public routes: read-only catalog + settings (no auth needed)
//  - /api/admin/*: requires a valid session cookie; every handler re-checks
//    the role on the SERVER (never trusting the client)
//  - Users management: admin role only
//  - Passwords: salted SHA-256 (128-bit random salt per user)
//  - Sessions: HttpOnly cookie, 7 days, stored in D1

const SESSION_DAYS = 7;
const COOKIE = "nabil_session";

// Allowed frontend origins (Cloudflare Pages URL + custom domain).
// Production: npx wrangler secret put ALLOWED_ORIGINS
//   value: https://nabil.pages.dev,https://your-domain.com
function corsHeaders(req, env) {
  const origin = req.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  if (origin && allowed.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }
  return {};
}

// ---------- Helpers ----------
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers, ..._cors },
  });
}

function uid() {
  return crypto.randomUUID();
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  const s = salt || [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${s}:${await sha256(s + ":" + password)}`;
}

async function verifyPassword(password, stored) {
  // إذا لم تكن كلمة المرور مخزنة بتنسيق التشفير، قارنها مباشرة (النص العادي)
  if (!stored.includes(":")) {
    return password === stored;
  }
  const [salt] = stored.split(":");
  return (await hashPassword(password, salt)) === stored;
}

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.get("Cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function sessionCookie(token, maxAgeSec) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

async function getSessionUser(req, env) {
  const token = parseCookies(req)[COOKIE];
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.name, u.email, u.role, s.expires_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`
  ).bind(token).first();
  if (!row) return null;
  if (new Date(row.expires_at.replace(" ", "T") + "Z") < new Date()) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    return null;
  }
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

// Permission enforcement — called server-side in EVERY protected handler.
function requireAuth(user) {
  if (!user) return json({ error: "غير مصرّح بالوصول — سجّل الدخول أولًا" }, 401);
  return null;
}
function requireAdmin(user) {
  const err = requireAuth(user);
  if (err) return err;
  if (user.role !== "admin") return json({ error: "هذه العملية للمدير فقط" }, 403);
  return null;
}

const VALID_SETTINGS_KEYS = ["facebook_url", "whatsapp_url", "maps_url", "maps_embed"];

// ---------- Router ----------
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const { pathname } = url;
    const method = req.method;
    globalThis._cors = corsHeaders(req, env);

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: _cors });
    }

    try {
      const user = pathname.startsWith("/api/") ? await getSessionUser(req, env) : null;

      // ===== Image serving from R2 =====
      if (method === "GET" && pathname.startsWith("/images/")) {
        const key = pathname.slice("/images/".length);
        const obj = await env.IMAGES.get(key);
        if (!obj) return new Response("Not found", { status: 404 });
        return new Response(obj.body, {
          headers: {
            "Content-Type": obj.httpMetadata?.contentType || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      // ================= PUBLIC ROUTES =================

      // GET /api/products?search=&category=
      if (method === "GET" && pathname === "/api/products") {
        const search = url.searchParams.get("search")?.trim() || "";
        const category = url.searchParams.get("category") || "";
        let query = `SELECT p.*, c.name AS category_name FROM products p
                     LEFT JOIN categories c ON c.id = p.category_id`;
        const cond = [], params = [];
        if (search) { cond.push("p.name LIKE ?"); params.push(`%${search}%`); }
        if (category) { cond.push("p.category_id = ?"); params.push(category); }
        if (cond.length) query += " WHERE " + cond.join(" AND ");
        query += " ORDER BY p.created_at DESC";
        const { results } = await env.DB.prepare(query).bind(...params).all();
        return json(results);
      }

      // GET /api/categories
      if (method === "GET" && pathname === "/api/categories") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM categories ORDER BY name"
        ).all();
        return json(results);
      }

      // GET /api/settings
      if (method === "GET" && pathname === "/api/settings") {
        const { results } = await env.DB.prepare(
          "SELECT key, value FROM settings"
        ).all();
        return json(Object.fromEntries(results.map((r) => [r.key, r.value])));
      }

      // ================= AUTH =================

      // POST /api/auth/login
      if (method === "POST" && pathname === "/api/auth/login") {
        const { email, password } = await req.json();
        if (!email || !password) return json({ error: "أدخل البريد وكلمة المرور" }, 400);
        const row = await env.DB.prepare(
          "SELECT * FROM users WHERE email = ?"
        ).bind(String(email).toLowerCase().trim()).first();
        // Same generic error whether the email exists or not (prevents enumeration).
        if (!row || !(await verifyPassword(password, row.password))) {
          return json({ error: "بيانات الدخول غير صحيحة" }, 401);
        }
        const token = uid() + uid();
        const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString().slice(0, 19).replace("T", " ");
        await env.DB.prepare(
          "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
        ).bind(token, row.id, expires).run();
        return json(
          { id: row.id, name: row.name, email: row.email, role: row.role },
          200,
          { "Set-Cookie": sessionCookie(token, SESSION_DAYS * 86400) }
        );
      }

      // POST /api/auth/logout
      if (method === "POST" && pathname === "/api/auth/logout") {
        const token = parseCookies(req)[COOKIE];
        if (token) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
        return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
      }

      // GET /api/auth/me
      if (method === "GET" && pathname === "/api/auth/me") {
        if (!user) return json({ error: "غير مسجل" }, 401);
        return json(user);
      }

      // ============ ADMIN: PRODUCTS (admin + editor) ============

      const productId = pathname.match(/^\/api\/admin\/products\/(.+)$/)?.[1];

      if (method === "POST" && pathname === "/api/admin/products") {
        const err = requireAuth(user); if (err) return err;
        const { name, price, category_id, image, available } = await req.json();
        if (!name?.trim() || price == null || Number(price) < 0) {
          return json({ error: "اسم المنتج والسعر مطلوبان" }, 400);
        }
        await env.DB.prepare(
          `INSERT INTO products (id, name, price, category_id, image, available)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(uid(), name.trim(), Number(price), category_id || null,
              image || null, available ? 1 : 0).run();
        return json({ ok: true }, 201);
      }

      if (method === "PUT" && productId) {
        const err = requireAuth(user); if (err) return err;
        const { name, price, category_id, image, available } = await req.json();
        await env.DB.prepare(
          `UPDATE products SET name=?, price=?, category_id=?, image=?, available=? WHERE id=?`
        ).bind(name?.trim(), Number(price), category_id || null, image || null,
               available ? 1 : 0, productId).run();
        return json({ ok: true });
      }

      if (method === "DELETE" && productId) {
        const err = requireAuth(user); if (err) return err;
        await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(productId).run();
        return json({ ok: true });
      }

      // ============ ADMIN: CATEGORIES (admin + editor) ============

      const catId = pathname.match(/^\/api\/admin\/categories\/(.+)$/)?.[1];

      if (method === "POST" && pathname === "/api/admin/categories") {
        const err = requireAuth(user); if (err) return err;
        const { name, image } = await req.json();
        if (!name?.trim()) return json({ error: "اسم التصنيف مطلوب" }, 400);
        await env.DB.prepare(
          "INSERT INTO categories (id, name, image) VALUES (?, ?, ?)"
        ).bind(uid(), name.trim(), image || null).run();
        return json({ ok: true }, 201);
      }

      if (method === "PUT" && catId) {
        const err = requireAuth(user); if (err) return err;
        const { name, image } = await req.json();
        await env.DB.prepare(
          "UPDATE categories SET name=?, image=? WHERE id=?"
        ).bind(name?.trim(), image || null, catId).run();
        return json({ ok: true });
      }

      if (method === "DELETE" && catId) {
        const err = requireAuth(user); if (err) return err;
        await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(catId).run();
        return json({ ok: true });
      }

      // ============ ADMIN: SETTINGS (admin + editor) ============

      if (method === "PUT" && pathname === "/api/admin/settings") {
        const err = requireAuth(user); if (err) return err;
        const body = await req.json();
        const stmts = Object.keys(body)
          .filter((k) => VALID_SETTINGS_KEYS.includes(k))
          .map((k) => env.DB.prepare(
            "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
          ).bind(k, String(body[k] ?? "")));
        await env.DB.batch(stmts);
        return json({ ok: true });
      }

      // ============ ADMIN: IMAGE UPLOAD → R2 (admin + editor) ============

      if (method === "POST" && pathname === "/api/admin/upload") {
        const err = requireAuth(user); if (err) return err;
        const form = await req.formData();
        const file = form.get("file");
        if (!file || typeof file.arrayBuffer !== "function") {
          return json({ error: "لم يتم إرسال ملف صورة" }, 400);
        }
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
        if (!allowed.includes(file.type)) {
          return json({ error: "الصيغ المسموحة: JPG, PNG, WebP, AVIF" }, 400);
        }
        if (file.size > 5 * 1024 * 1024) {
          return json({ error: "حجم الصورة يجب أن يكون أقل من 5MB" }, 400);
        }
        const ext = file.type.split("/")[1].replace("jpeg", "jpg");
        const key = `products/${Date.now()}-${uid()}.${ext}`;
        await env.IMAGES.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type },
        });
        return json({ url: `/images/${key}` }, 201);
      }

      // ============ ADMIN: USERS — ADMIN ONLY ============

      if (method === "GET" && pathname === "/api/admin/users") {
        const err = requireAdmin(user); if (err) return err;
        const { results } = await env.DB.prepare(
          "SELECT id, name, email, role, created_at FROM users ORDER BY created_at"
        ).all();
        return json(results);
      }

      if (method === "POST" && pathname === "/api/admin/users") {
        const err = requireAdmin(user); if (err) return err;
        const { name, email, password, role } = await req.json();
        if (!name?.trim() || !email || !password) {
          return json({ error: "كل الحقول مطلوبة" }, 400);
        }
        if (!["admin", "editor"].includes(role)) {
          return json({ error: "دور غير صالح" }, 400);
        }
        if (String(password).length < 8) {
          return json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, 400);
        }
        const exists = await env.DB.prepare(
          "SELECT id FROM users WHERE email = ?"
        ).bind(String(email).toLowerCase().trim()).first();
        if (exists) return json({ error: "هذا البريد مسجّل بالفعل" }, 409);
        await env.DB.prepare(
          "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)"
        ).bind(uid(), name.trim(), String(email).toLowerCase().trim(),
              await hashPassword(String(password)), role).run();
        return json({ ok: true }, 201);
      }

      const userRoleMatch = pathname.match(/^\/api\/admin\/users\/(.+)\/role$/);
      if (method === "PUT" && userRoleMatch) {
        const err = requireAdmin(user); if (err) return err;
        const { role } = await req.json();
        if (!["admin", "editor"].includes(role)) {
          return json({ error: "دور غير صالح" }, 400);
        }
        // An admin cannot remove their own admin role (prevents lockout).
        if (userRoleMatch[1] === user.id && role !== "admin") {
          return json({ error: "لا يمكنك إزالة صلاحيات المدير عن نفسك" }, 400);
        }
        await env.DB.prepare("UPDATE users SET role = ? WHERE id = ?")
          .bind(role, userRoleMatch[1]).run();
        return json({ ok: true });
      }

      const userIdMatch = pathname.match(/^\/api\/admin\/users\/(.+)$/);
      if (method === "DELETE" && userIdMatch) {
        const err = requireAdmin(user); if (err) return err;
        if (userIdMatch[1] === user.id) {
          return json({ error: "لا يمكنك حذف حسابك الخاص" }, 400);
        }
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userIdMatch[1]).run();
        return json({ ok: true });
      }

      return json({ error: "المسار غير موجود" }, 404);
    } catch (e) {
      return json({ error: "خطأ في الخادم" }, 500);
    }
  },
};
