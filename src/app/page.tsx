"use client";

import { Account } from "@/components/account";
import { LoadingSpinner } from "@/components/loading";
import { WalletOptions } from "@/components/walletOptions";
import { getPublicClient } from "@/utils/clients";
import { sendSessionCall } from "@/utils/sendSessionCall";
import { getSession } from "@/utils/session";
import { getPermissionId } from "@rhinestone/module-sdk";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Address, encodeFunctionData, parseAbi } from "viem";
import { hashAuthorization } from "viem/experimental";

export default function Home() {
  const [eoa, setEOA] = useState<any>();
  const [counter, setCounter] = useState<number>(0);
  const [sessionTxLoading, setSessionTxLoading] = useState(false);

  const getCounter = async () => {
    if (!eoa) return;
    const publicClient = getPublicClient();
    const newCounter = (await publicClient.readContract({
      address: "0x6fc7314c80849622b04d943a6714b05078ca2d05" as Address,
      abi: parseAbi(["function count(address) external returns(uint256)"]),
      functionName: "count",
      args: [eoa.address],
    })) as number;
    setCounter(newCounter);
  };

  const makeSessionCall = async () => {
    setSessionTxLoading(true);
    await sendSessionCall({
      accountAddress: eoa.address,
      calls: [
        {
          to: "0x6fc7314c80849622b04d943a6714b05078ca2d05" as Address,
          value: 0,
          data: encodeFunctionData({
            abi: parseAbi(["function increment() external"]),
          }),
        },
      ],
    });
    await getCounter();
    setSessionTxLoading(false);
  };

  useEffect(() => {
    getCounter();
  }, [eoa]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-row items-center align-center">
          <Image
            className="dark:invert"
            src="/rhinestone.svg"
            alt="Rhinestone logo"
            width={180}
            height={38}
            priority
          />{" "}
          <span className="text-lg font-bold">x 7702</span>
        </div>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">Connect your EOA. </li>
          <li className="mb-2">
            Convert it into a smart account with smart sessions.
          </li>
          <li>Use session keys on your EOA.</li>
        </ol>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {eoa ? <Account eoa={eoa} /> : <WalletOptions setEOA={setEOA} />}
          {eoa ? (
            <button
              onClick={makeSessionCall}
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            >
              {sessionTxLoading ? <LoadingSpinner /> : "Use session key"}
            </button>
          ) : null}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        Count: {counter}
      </footer>
    </div>
  );
}
