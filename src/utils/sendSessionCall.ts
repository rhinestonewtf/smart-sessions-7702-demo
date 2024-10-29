import {
  getAccount,
  encodeSmartSessionSignature,
  getOwnableValidatorMockSignature,
  encodeValidatorNonce,
  SmartSessionMode,
  getSmartSessionsValidator,
  getPermissionId,
} from "@rhinestone/module-sdk";
import {
  entryPoint07Address,
  getUserOperationHash,
} from "viem/account-abstraction";
import { getAccountNonce } from "permissionless/actions";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { Address, Hex } from "viem";
import {
  getPimlicoClient,
  getPublicClient,
  getSmartAccountClient,
} from "./clients";
import { getSession } from "./session";

export const sendSessionCall = async ({
  accountAddress,
  calls,
}: {
  accountAddress: Address;
  calls: unknown[];
}) => {
  const smartSessions = getSmartSessionsValidator({});
  const smartAccountClient = await getSmartAccountClient({ accountAddress });
  const publicClient = getPublicClient();
  const pimlicoClient = getPimlicoClient();

  const nonce = await getAccountNonce(publicClient, {
    address: accountAddress,
    entryPointAddress: entryPoint07Address,
    key: encodeValidatorNonce({
      account: getAccount({
        address: accountAddress,
        type: "safe",
      }),
      validator: smartSessions,
    }),
  });

  const permissionId = getPermissionId({
    session: getSession(),
  });

  const sessionDetails = {
    mode: SmartSessionMode.USE,
    permissionId,
    signature: getOwnableValidatorMockSignature({
      threshold: 1,
    }),
  };

  const userOperation = await smartAccountClient.prepareUserOperation({
    account: smartAccountClient.account,
    calls,
    nonce,
    signature: encodeSmartSessionSignature(sessionDetails),
  });

  const userOpHashToSign = getUserOperationHash({
    chainId: sepolia.id,
    entryPointAddress: entryPoint07Address,
    entryPointVersion: "0.7",
    userOperation,
  });

  const sessionOwner = privateKeyToAccount(
    process.env.NEXT_PUBLIC_SESSION_OWNER! as Hex,
  );

  sessionDetails.signature = await sessionOwner.signMessage({
    message: { raw: userOpHashToSign },
  });

  userOperation.signature = encodeSmartSessionSignature(sessionDetails);

  const userOpHash = await smartAccountClient.sendUserOperation(userOperation);

  const receipt = await pimlicoClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log(receipt);

  return receipt;
};
