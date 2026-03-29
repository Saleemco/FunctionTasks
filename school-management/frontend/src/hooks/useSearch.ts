import { useState, useMemo } from "react";

export const useSearch = <T,>(
  items: T[],
  searchFields: (keyof T)[],
  customFilter?: (item: T, searchTerm: string) => boolean
) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const term = searchTerm.toLowerCase().trim();
    
    return items.filter((item) => {
      if (customFilter) {
        return customFilter(item, term);
      }
      
      return searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  }, [items, searchTerm, searchFields, customFilter]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
  };
};
