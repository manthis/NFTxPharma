import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [authState, setAuthState] = useState(null);
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (address) {
            const userData = {
                isConnected: isConnected,
                address: address,
            };

            setAuthState(userData);
        } else {
            // Gérer le cas où address est null
            setAuthState(null);
        }
    }, [isConnected, address]);

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
