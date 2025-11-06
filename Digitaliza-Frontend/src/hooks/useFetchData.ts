// src/hooks/useFetchData.ts
import { useEffect, useState } from "react";

export function useFetchData<T>(fetchFunction: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchFunction();
        setData(result);
      } catch (err) {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchFunction]);

  return { data, setData, loading, error };
}
