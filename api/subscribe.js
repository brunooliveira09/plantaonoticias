// api/subscribe.js
// Roda no servidor (Vercel), nunca no navegador.
// As credenciais do Supabase ficam em variáveis de ambiente do projeto Vercel,
// nunca no HTML entregue ao visitante.

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Variáveis de ambiente do Supabase não configuradas.");
    res.status(500).json({ error: "Configuração ausente no servidor" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const nome = (body?.nome || "").toString().trim();
  const whatsappRaw = (body?.whatsapp || "").toString();
  const especialidade = (body?.especialidade || "").toString().trim();
  const whatsapp = whatsappRaw.replace(/\D/g, "");

  if (!nome || whatsapp.length < 10 || !especialidade) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify([{ nome, whatsapp, especialidade }])
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Erro Supabase:", errText);
      res.status(502).json({ error: "Falha ao salvar cadastro" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
};
