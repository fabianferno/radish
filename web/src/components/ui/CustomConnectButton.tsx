import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button";

export const CustomConnectButton = () => {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button
                                        onClick={openConnectModal}
                                        variant="outline"
                                        className="font-medium bg-yellow-100"

                                    >
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <Button
                                        onClick={openChainModal}
                                        variant="destructive"
                                        className="font-medium"
                                    >
                                        Wrong network
                                    </Button>
                                );
                            }

                            return (
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={openChainModal}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                className="w-4 h-4 rounded-full overflow-hidden"
                                                style={{
                                                    background: chain.iconBackground,
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        className="w-4 h-4"
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {chain.name}
                                    </Button>

                                    <Button
                                        onClick={openAccountModal}
                                        variant="outline"
                                        size="sm"
                                        className="font-medium"
                                    >
                                        {account.displayName}
                                        {account.displayBalance
                                            ? ` (${account.displayBalance})`
                                            : ''}
                                    </Button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};