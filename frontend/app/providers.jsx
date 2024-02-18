"use client";

import { ChakraProvider } from "@chakra-ui/react";
import {
    RainbowKitProvider,
    darkTheme,
    getDefaultConfig,
    getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import {
    argentWallet,
    ledgerWallet,
    trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

const { wallets } = getDefaultWallets();

let networks = [];
if (process.env.NODE_ENV === "production") {
    networks.push(sepolia);
} else {
    networks.push(hardhat);
}

const config = getDefaultConfig({
    appName: "PharmaxNFT",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    wallets: [
        ...wallets,
        {
            groupName: "Other",
            wallets: [argentWallet, trustWallet, ledgerWallet],
        },
    ],
    chains: networks,
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    coolMode
                    theme={darkTheme({ accentColor: "#7b3fe4" })}
                >
                    <ChakraProvider>{children}</ChakraProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
