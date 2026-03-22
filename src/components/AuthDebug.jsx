import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function AuthDebug() {
  const [status, setStatus] = useState("Testando conexão com Supabase...");

  useEffect(() => {
    async function testConnection() {
      if (!isSupabaseConfigured || !supabase) {
        setStatus("Supabase não configurado.");
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus(`Erro: ${error.message}`);
          return;
        }

        if (data.session) {
          setStatus("Supabase conectado. Sessão encontrada.");
        } else {
          setStatus("Supabase conectado. Nenhuma sessão ativa.");
        }
      } catch (err) {
        setStatus(`Falha: ${err.message}`);
      }
    }

    testConnection();
  }, []);

  return <div style={{ padding: "8px", fontSize: "14px" }}>{status}</div>;
}
