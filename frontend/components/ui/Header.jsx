import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Header = () => {
    return (
        <div
            id="header"
            className="fixed top-0 h-20 bg-transparent w-full flex justify-between items-center z-20 px-4"
        >
            <div className="flex flex-row items-center justify-center">
                <img src="logo.png" className="h-[60px]" />
                <h1 className="text-3xl font-bold pl-4 text-white">
                    NFTxPharma
                </h1>
            </div>

            <div className="m-2">
                <ConnectButton />
            </div>
        </div>
    );
};
