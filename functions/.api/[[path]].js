export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // إزالة بادئة /api من الرابط لتسهيل المطابقة
  let path = url.pathname.replace(/^\/api/, '');
  const method = request.method;

  // دالة مساعدة لإرجاع بيانات بصيغة JSON
  const json = (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });

  try {
    // 1. جلب المنتجات
    if (path === '/products' && method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM products").all();
      return json(results || []);
    }

    // 2. جلب التصنيفات
    if (path === '/categories' && method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM categories").all();
      return json(results || []);
    }

    // 3. جلب الإعدادات
    if (path === '/settings' && method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM settings").all();
      return json(results[0] || {});
    }

    // 4. تسجيل الدخول (Admin Login)
    if (path === '/auth/login' && method === 'POST') {
      const body = await request.json();
      const { email, password } = body;

      // البحث عن المستخدم في جدول users الذي أنشأناه
      const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?")
        .bind(email, password)
        .first();

      if (!user) {
        return json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, 401);
      }

      return json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    }

    // 5. تسجيل الخروج
    if (path === '/auth/logout' && method === 'POST') {
      return json({ success: true });
    }

    // 6. التحقق من الجلسة الحالية
    if (path === '/auth/me' && method === 'GET') {
      // يمكنك لاحقاً ربطه بـ Cookies أو إرجاع خطأ إذا لم يكن مسجلاً
      return json({ error: "غير مسجل الدخول" }, 401);
    }

    // إذا لم يطابق أي مسار
    return json({ error: "المسار غير موجود" }, 404);

  } catch (err) {
    return json({ error: err.message || "حدث خطأ في الخادم" }, 500);
  }
}
