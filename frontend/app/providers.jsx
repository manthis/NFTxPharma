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
import {
    arbitrum,
    base,
    hardhat,
    mainnet,
    optimism,
    polygon,
    sepolia,
    zora,
} from "wagmi/chains";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
    appName: "RainbowKit demo",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    wallets: [
        ...wallets,
        {
            groupName: "Other",
            wallets: [argentWallet, trustWallet, ledgerWallet],
        },
    ],
    chains: [
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        zora,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
            ? [sepolia, hardhat]
            : []),
    ],
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
