import { useEffect, useState } from "react";
import type { IActuacion } from "../types/actuaciones";
import { getPendientesNotificacion } from "../api/actuacionesApi";

export const usePendientesNotificacion = () => {
  const [pendientes, setPendientes] = useState<IActuacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPendientesNotificacion();
        setPendientes(data as any);
      } catch (e) {
        console.error("Error cargando pendientes notificación", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { pendientes, setPendientes, loading };
};
