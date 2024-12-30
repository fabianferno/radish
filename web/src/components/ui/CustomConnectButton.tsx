import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

export const CustomConnectButton = ({
    dark,
}: {
    dark?: boolean
}) => {
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
                                        className={!dark ?
                                            `font-medium border-neo-green text-neo-green hover:bg-neo-green hover:text-black` :
                                            `font-medium border-t border-black text-black hover:bg-neo-green hover:text-black`
                                        }
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
                                        className={!dark ?
                                            `flex items-center gap-2 text-white` :
                                            `flex items-center gap-2 text-black border-t border-black`
                                        }
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                className="w-4 h-4 rounded-full overflow-hidden"
                                                style={{
                                                    background: chain.iconBackground,
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <Image
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        className="w-4 h-4"
                                                        width={20}
                                                        height={20}
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
                                        className={!dark ?
                                            `font-medium text-white border-neo-green` :
                                            `font-medium text-black border-t border-black`
                                        }
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