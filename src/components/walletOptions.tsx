"use client";
import * as React from "react";
import { Address, Hex } from "viem";
import {
  generatePrivateKey,
  privateKeyToAccount,
  toAccount,
} from "viem/accounts";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function WalletOptions({
  setEOA,
}: {
  setEOA: React.Dispatch<React.SetStateAction<any>>;
}) {
  const { connect } = useConnect();
  const connector = injected();

  const importAccount = () => {
    const key = prompt("Add address or private key", "0x...");
    if (!key) return;

    let owner;
    if (key.length == 42) {
      owner = toAccount({
        address: key as Address,

        async signMessage({ message }) {},

        async signTransaction(transaction, { serializer }) {},

        async signTypedData(typedData) {},
      });
    } else if (key.length == 66) {
      owner = privateKeyToAccount(key as Hex);
    }
    setEOA(owner);
  };

  return (
    <div className="flex flex-row gap-x-4">
      <button
        onClick={() => connect({ connector })}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      >
        Connect EOA
      </button>
      <button
        onClick={importAccount}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      >
        Import EOA
      </button>
    </div>
  );
}
