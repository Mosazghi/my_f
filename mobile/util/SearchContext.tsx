import { createContext } from "react";
import { useState } from "react";

type SearchContextType = {
    search: string;
    setSearch: (search: string) => void;
};
const SearchContext = createContext({} as SearchContextType);

const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [search, setSearch] = useState("");

    return (
        <SearchContext.Provider value={{ search, setSearch }}>
            {children}
        </SearchContext.Provider>
    );
};

export { SearchContext, SearchProvider };
