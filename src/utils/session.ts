import {
  encodeValidationData,
  getSudoPolicy,
  OWNABLE_VALIDATOR_ADDRESS,
  Session,
} from "@rhinestone/module-sdk";
import { Address, Hex, toBytes, toFunctionSelector, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

export const getSession = () => {
  const sessionOwner = privateKeyToAccount(
    process.env.NEXT_PUBLIC_SESSION_OWNER! as Hex,
  );

  const session: Session = {
    sessionValidator: OWNABLE_VALIDATOR_ADDRESS,
    sessionValidatorInitData: encodeValidationData({
      threshold: 1,
      owners: [sessionOwner.address],
    }),
    salt: toHex(toBytes("0", { size: 32 })),
    userOpPolicies: [],
    erc7739Policies: {
      allowedERC7739Content: [],
      erc1271Policies: [],
    },
    actions: [
      {
        actionTarget: "0x6fc7314c80849622b04d943a6714b05078ca2d05" as Address,
        actionTargetSelector: toFunctionSelector("function increment()"),
        actionPolicies: [getSudoPolicy()],
      },
    ],
    chainId: BigInt(sepolia.id),
  };
  return session;
};
