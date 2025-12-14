// src/hooks/usePendientesVincActa.ts

import { useEffect, useState } from "react";
import type { IActuacion } from "../types/actuaciones";
import { getPendientesVincActa } from "../api/actuacionesApi";

export const usePendientesVincActa = () => {
  const [pendientes, setPendientes] = useState<IActuacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await getPendientesVincActa();
        if (alive) setPendientes(data as any);
      } catch (e) {
        console.error("Error cargando pendientes vinculación acta", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { pendientes, setPendientes, loading };
};
