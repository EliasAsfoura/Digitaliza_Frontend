
import { useState } from "react";

export const useDeleteRow = <T,>(initialData: T[]) => {
  const [data, setData] = useState<T[]>(initialData);

  const handleDelete = (rowIndex: number) => {
    setData((prevData) => prevData.filter((_, index) => index !== rowIndex));
  };

  return { data, setData, handleDelete };
};
