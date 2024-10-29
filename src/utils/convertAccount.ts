import {
  getSmartSessionsValidator,
  OWNABLE_VALIDATOR_ADDRESS,
  getSudoPolicy,
  Session,
  RHINESTONE_ATTESTER_ADDRESS,
  MOCK_ATTESTER_ADDRESS,
  getOwnableValidator,
  encodeValidationData,
} from "@rhinestone/module-sdk";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  toHex,
  Address,
  Hex,
  toBytes,
  parseAbi,
  encodeFunctionData,
  zeroAddress,
} from "viem";
import { SignedAuthorization } from "viem/experimental";
import { writeContract } from "viem/actions";
import { sepolia } from "viem/chains";
import { getPublicClient } from "./clients";
import { getSession } from "./session";

export const convertAccount = async ({
  eoaAddress,
  authorization,
}: {
  eoaAddress: Address;
  authorization: SignedAuthorization;
}) => {
  const sponsorAccount = privateKeyToAccount(
    process.env.NEXT_PUBLIC_SPONSOR! as Hex,
  );

  // note: safe currently allows address(this) to be an owner
  const safeOwner = privateKeyToAccount(generatePrivateKey());

  const ownableValidator = getOwnableValidator({
    owners: [eoaAddress],
    threshold: 1,
  });

  const session = getSession();

  const smartSessions = getSmartSessionsValidator({
    sessions: [session],
  });

  const publicClient = getPublicClient();

  const txHash = await writeContract(publicClient, {
    address: eoaAddress,
    abi: parseAbi([
      "function setup(address[] calldata _owners,uint256 _threshold,address to,bytes calldata data,address fallbackHandler,address paymentToken,uint256 payment, address paymentReceiver) external",
    ]),
    functionName: "setup",
    args: [
      [safeOwner.address],
      BigInt(1),
      "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
      encodeFunctionData({
        abi: parseAbi([
          "struct ModuleInit {address module;bytes initData;}",
          "function addSafe7579(address safe7579,ModuleInit[] calldata validators,ModuleInit[] calldata executors,ModuleInit[] calldata fallbacks, ModuleInit[] calldata hooks,address[] calldata attesters,uint8 threshold) external",
        ]),
        functionName: "addSafe7579",
        args: [
          "0x7579EE8307284F293B1927136486880611F20002",
          [
            {
              module: ownableValidator.address,
              initData: ownableValidator.initData,
            },
            {
              module: smartSessions.address,
              initData: smartSessions.initData,
            },
          ],
          [],
          [],
          [],
          [
            RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
            MOCK_ATTESTER_ADDRESS, // Mock Attester - do not use in production
          ],
          1,
        ],
      }),
      "0x7579EE8307284F293B1927136486880611F20002",
      zeroAddress,
      BigInt(0),
      zeroAddress,
    ],
    account: sponsorAccount,
    authorizationList: [authorization],
  });

  console.log("txHash", txHash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });

  console.log("receipt", receipt);
};
