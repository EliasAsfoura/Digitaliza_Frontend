import { useEffect, useState } from "react";
import { getCardsActuaciones, type CardsResumen } from "../api/actuacionesApi";

export const useCardsActuaciones = () => {
  const [cards, setCards] = useState<CardsResumen>({
    actuaciones: 0,
    relevamientos: 0,
    pendientes: 0,
    vinculacionActaPendiente: 0,
    vinculacionOficioPendiente: 0,
  });

  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCardsActuaciones();
        setCards(res);
      } catch (e) {
        console.error("Error cargando cards actuaciones", e);
      } finally {
        setLoadingCards(false);
      }
    })();
  }, []);

  return { cards, loadingCards };
};
