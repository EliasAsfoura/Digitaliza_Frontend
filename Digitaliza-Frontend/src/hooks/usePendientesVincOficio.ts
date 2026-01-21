// src/hooks/usePendientesVincOficio.ts

import { useEffect, useState } from "react";
import type { IActuacion } from "../types/actuaciones";
import { getPendientesVincOficio } from "../api/actuacionesApi";

export const usePendientesVincOficio = () => {
  const [pendientes, setPendientes] = useState<IActuacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPendientesVincOficio();
        setPendientes(data as any);
      } catch (e) {
        console.error("Error cargando pendientes vinculación oficio", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { pendientes, setPendientes, loading };
};
