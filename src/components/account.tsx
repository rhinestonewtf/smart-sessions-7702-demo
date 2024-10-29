"use client";
import { getPublicClient } from "@/utils/clients";
import { convertAccount } from "@/utils/convertAccount";
import { useEffect, useState } from "react";
import { Address, Hex, parseSignature, Signature } from "viem";
import {
  hashAuthorization,
  signAuthorization,
  verifyAuthorization,
} from "viem/experimental";
import { useAccount } from "wagmi";
import { signMessage } from "@wagmi/core";
import { config } from "@/utils/config";
import { getConnections, getConnectorClient } from "wagmi/actions";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { LoadingSpinner } from "./loading";

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function Account({ eoa }: { eoa: any }) {
  const { address } = useAccount();
  const [isConverted, setIsConverted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getEOAStatus = async () => {
    if (!eoa?.address) return;

    const publicClient = getPublicClient();
    const bytecode = await publicClient.getCode({
      address: eoa.address,
    });

    console.log(bytecode);

    if (bytecode && bytecode != "0x") {
      setIsConverted(true);
    }
  };

  useEffect(() => {
    getEOAStatus();
  }, [address]);

  const getSignedAuthorization = async () => {
    console.log(eoa);
    if (!eoa) return;
    if (isConverted) return;

    setIsLoading(true);

    const sponsorAccount = privateKeyToAccount(
      process.env.NEXT_PUBLIC_SPONSOR! as Hex,
    );

    const publicClient = getPublicClient();
    const authorization = await signAuthorization(publicClient, {
      account: eoa,
      contractAddress: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
      delegate: sponsorAccount,
    });

    // note: logic for using injected wallets when they support 7702
    // if (!address) return;
    //
    // const contractAddress =
    //   "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762" as Address;
    // const chainId = await publicClient.getChainId();
    // const nonce = await publicClient.getTransactionCount({
    //   address,
    // });
    //
    // const authorizationHash = hashAuthorization({
    //   contractAddress,
    //   chainId,
    //   nonce,
    // });
    //
    // const compactSignature = (await signMessage(config, {
    //   message: { raw: authorizationHash },
    // })) as Hex;
    // const signature = parseSignature(compactSignature);
    //
    // const authorization = {
    //   contractAddress,
    //   chainId,
    //   nonce,
    //   ...(signature as Signature),
    // };
    //
    await convertAccount({
      eoaAddress: eoa.address,
      authorization,
    });

    await getEOAStatus();

    setIsLoading(false);
  };

  return (
    <button
      onClick={getSignedAuthorization}
      className="rounded-full border border-solid border-transparent transition-colors flex  items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : isConverted ? (
        eoa && <div>{formatAddress(eoa.address)}</div>
      ) : (
        "Sign authorization"
      )}
    </button>
  );
}
