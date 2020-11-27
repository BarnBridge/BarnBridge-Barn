/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface RewardsInterface extends ethers.utils.Interface {
  functions: {
    "ackFunds()": FunctionFragment;
    "balanceBefore()": FunctionFragment;
    "barn()": FunctionFragment;
    "claim()": FunctionFragment;
    "currentMultiplier()": FunctionFragment;
    "lastPullTs()": FunctionFragment;
    "owner()": FunctionFragment;
    "pullDuration()": FunctionFragment;
    "pullEndAt()": FunctionFragment;
    "pullStartAt()": FunctionFragment;
    "pullTokenFrom()": FunctionFragment;
    "pullTotalAmount()": FunctionFragment;
    "registerUserAction(address)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setBarn(address)": FunctionFragment;
    "setupPullToken(address,uint256,uint256,uint256)": FunctionFragment;
    "token()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "userClaimableReward(address)": FunctionFragment;
    "userMultiplier(address)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "ackFunds", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "balanceBefore",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "barn", values?: undefined): string;
  encodeFunctionData(functionFragment: "claim", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "currentMultiplier",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lastPullTs",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pullDuration",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "pullEndAt", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pullStartAt",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "pullTokenFrom",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "pullTotalAmount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "registerUserAction",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "setBarn", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setupPullToken",
    values: [string, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "token", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "userClaimableReward",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "userMultiplier",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "ackFunds", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "balanceBefore",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "barn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claim", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "currentMultiplier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lastPullTs", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pullDuration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "pullEndAt", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pullStartAt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pullTokenFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pullTotalAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerUserAction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setBarn", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setupPullToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "userClaimableReward",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "userMultiplier",
    data: BytesLike
  ): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export class Rewards extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: RewardsInterface;

  functions: {
    ackFunds(overrides?: Overrides): Promise<ContractTransaction>;

    "ackFunds()"(overrides?: Overrides): Promise<ContractTransaction>;

    balanceBefore(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "balanceBefore()"(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    barn(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "barn()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    claim(overrides?: Overrides): Promise<ContractTransaction>;

    "claim()"(overrides?: Overrides): Promise<ContractTransaction>;

    currentMultiplier(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "currentMultiplier()"(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    lastPullTs(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "lastPullTs()"(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    owner(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "owner()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    pullDuration(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "pullDuration()"(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    pullEndAt(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "pullEndAt()"(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    pullStartAt(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "pullStartAt()"(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    pullTokenFrom(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "pullTokenFrom()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    pullTotalAmount(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "pullTotalAmount()"(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    registerUserAction(
      user: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "registerUserAction(address)"(
      user: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    renounceOwnership(overrides?: Overrides): Promise<ContractTransaction>;

    "renounceOwnership()"(overrides?: Overrides): Promise<ContractTransaction>;

    setBarn(_barn: string, overrides?: Overrides): Promise<ContractTransaction>;

    "setBarn(address)"(
      _barn: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setupPullToken(
      source: string,
      startAt: BigNumberish,
      endAt: BigNumberish,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setupPullToken(address,uint256,uint256,uint256)"(
      source: string,
      startAt: BigNumberish,
      endAt: BigNumberish,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    token(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "token()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    userClaimableReward(
      user: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "userClaimableReward(address)"(
      user: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    userMultiplier(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "userMultiplier(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;
  };

  ackFunds(overrides?: Overrides): Promise<ContractTransaction>;

  "ackFunds()"(overrides?: Overrides): Promise<ContractTransaction>;

  balanceBefore(overrides?: CallOverrides): Promise<BigNumber>;

  "balanceBefore()"(overrides?: CallOverrides): Promise<BigNumber>;

  barn(overrides?: CallOverrides): Promise<string>;

  "barn()"(overrides?: CallOverrides): Promise<string>;

  claim(overrides?: Overrides): Promise<ContractTransaction>;

  "claim()"(overrides?: Overrides): Promise<ContractTransaction>;

  currentMultiplier(overrides?: CallOverrides): Promise<BigNumber>;

  "currentMultiplier()"(overrides?: CallOverrides): Promise<BigNumber>;

  lastPullTs(overrides?: CallOverrides): Promise<BigNumber>;

  "lastPullTs()"(overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  "owner()"(overrides?: CallOverrides): Promise<string>;

  pullDuration(overrides?: CallOverrides): Promise<BigNumber>;

  "pullDuration()"(overrides?: CallOverrides): Promise<BigNumber>;

  pullEndAt(overrides?: CallOverrides): Promise<BigNumber>;

  "pullEndAt()"(overrides?: CallOverrides): Promise<BigNumber>;

  pullStartAt(overrides?: CallOverrides): Promise<BigNumber>;

  "pullStartAt()"(overrides?: CallOverrides): Promise<BigNumber>;

  pullTokenFrom(overrides?: CallOverrides): Promise<string>;

  "pullTokenFrom()"(overrides?: CallOverrides): Promise<string>;

  pullTotalAmount(overrides?: CallOverrides): Promise<BigNumber>;

  "pullTotalAmount()"(overrides?: CallOverrides): Promise<BigNumber>;

  registerUserAction(
    user: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "registerUserAction(address)"(
    user: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  renounceOwnership(overrides?: Overrides): Promise<ContractTransaction>;

  "renounceOwnership()"(overrides?: Overrides): Promise<ContractTransaction>;

  setBarn(_barn: string, overrides?: Overrides): Promise<ContractTransaction>;

  "setBarn(address)"(
    _barn: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setupPullToken(
    source: string,
    startAt: BigNumberish,
    endAt: BigNumberish,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setupPullToken(address,uint256,uint256,uint256)"(
    source: string,
    startAt: BigNumberish,
    endAt: BigNumberish,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  token(overrides?: CallOverrides): Promise<string>;

  "token()"(overrides?: CallOverrides): Promise<string>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "transferOwnership(address)"(
    newOwner: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  userClaimableReward(
    user: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "userClaimableReward(address)"(
    user: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  userMultiplier(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  "userMultiplier(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    ackFunds(overrides?: CallOverrides): Promise<void>;

    "ackFunds()"(overrides?: CallOverrides): Promise<void>;

    balanceBefore(overrides?: CallOverrides): Promise<BigNumber>;

    "balanceBefore()"(overrides?: CallOverrides): Promise<BigNumber>;

    barn(overrides?: CallOverrides): Promise<string>;

    "barn()"(overrides?: CallOverrides): Promise<string>;

    claim(overrides?: CallOverrides): Promise<void>;

    "claim()"(overrides?: CallOverrides): Promise<void>;

    currentMultiplier(overrides?: CallOverrides): Promise<BigNumber>;

    "currentMultiplier()"(overrides?: CallOverrides): Promise<BigNumber>;

    lastPullTs(overrides?: CallOverrides): Promise<BigNumber>;

    "lastPullTs()"(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    "owner()"(overrides?: CallOverrides): Promise<string>;

    pullDuration(overrides?: CallOverrides): Promise<BigNumber>;

    "pullDuration()"(overrides?: CallOverrides): Promise<BigNumber>;

    pullEndAt(overrides?: CallOverrides): Promise<BigNumber>;

    "pullEndAt()"(overrides?: CallOverrides): Promise<BigNumber>;

    pullStartAt(overrides?: CallOverrides): Promise<BigNumber>;

    "pullStartAt()"(overrides?: CallOverrides): Promise<BigNumber>;

    pullTokenFrom(overrides?: CallOverrides): Promise<string>;

    "pullTokenFrom()"(overrides?: CallOverrides): Promise<string>;

    pullTotalAmount(overrides?: CallOverrides): Promise<BigNumber>;

    "pullTotalAmount()"(overrides?: CallOverrides): Promise<BigNumber>;

    registerUserAction(user: string, overrides?: CallOverrides): Promise<void>;

    "registerUserAction(address)"(
      user: string,
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    "renounceOwnership()"(overrides?: CallOverrides): Promise<void>;

    setBarn(_barn: string, overrides?: CallOverrides): Promise<void>;

    "setBarn(address)"(_barn: string, overrides?: CallOverrides): Promise<void>;

    setupPullToken(
      source: string,
      startAt: BigNumberish,
      endAt: BigNumberish,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "setupPullToken(address,uint256,uint256,uint256)"(
      source: string,
      startAt: BigNumberish,
      endAt: BigNumberish,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    token(overrides?: CallOverrides): Promise<string>;

    "token()"(overrides?: CallOverrides): Promise<string>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    userClaimableReward(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "userClaimableReward(address)"(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    userMultiplier(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    "userMultiplier(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {
    OwnershipTransferred(
      previousOwner: string | null,
      newOwner: string | null
    ): EventFilter;
  };

  estimateGas: {
    ackFunds(overrides?: Overrides): Promise<BigNumber>;

    "ackFunds()"(overrides?: Overrides): Promise<BigNumber>;

    balanceBefore(overrides?: CallOverrides): Promise<BigNumber>;

    "balanceBefore()"(overrides?: CallOverrides): Promise<BigNumber>;

    barn(overrides?: CallOverrides): Promise<BigNumber>;

    "barn()"(overrides?: CallOverrides): Promise<BigNumber>;

    claim(overrides?: Overrides): Promise<BigNumber>;

    "claim()"(overrides?: Overrides): Promise<BigNumber>;

    currentMultiplier(overrides?: CallOverrides): Promise<BigNumber>;

    "currentMultiplier()"(overrides?: CallOverrides): Promise<BigNumber>;

    lastPullTs(overrides?: CallOverrides): Promise<BigNumber>;

    "lastPullTs()"(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    "owner()"(overrides?: CallOverrides): Promise<BigNumber>;

    pullDuration(overrides?: CallOverrides): Promise<BigNumber>;

    "pullDuration()"(overrides?: CallOverrides): Promise<BigNumber>;

    pullEndAt(overrides?: CallOverrides): Promise<BigNumber>;

    "pullEndAt()"(overrides?: CallOverrides): Promise<BigNumber>;

    pullStartAt(overrides?: CallOverrides): Promise<BigNumber>;

    "pullStartAt()"(overrides?: CallOverrides): Promise<BigNumber>;

    pullTokenFrom(overrides?: CallOverrides): Promise<BigNumber>;

    "pullTokenFrom()"(overrides?: CallOverrides): Promise<BigNumber>;

    pullTotalAmount(overrides?: CallOverrides): Promise<BigNumber>;

    "pullTotalAmount()"(overrides?: CallOverrides): Promise<BigNumber>;

    registerUserAction(user: string, overrides?: Overrides): Promise<BigNumber>;

    "registerUserAction(address)"(
      user: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    renounceOwnership(overrides?: Overrides): Promise<BigNumber>;

    "renounceOwnership()"(overrides?: Overrides): Promise<BigNumber>;

    setBarn(_barn: string, overrides?: Overrides): Promise<BigNumber>;

    "setBarn(address)"(
      _barn: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setupPullToken(
      source: string,
      startAt: BigNumberish,
      endAt: BigNumberish,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setupPullToken(address,uint256,uint256,uint256)"(
      source: string,
      startAt: BigNumberish,
      endAt: BigNumberish,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    token(overrides?: CallOverrides): Promise<BigNumber>;

    "token()"(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    userClaimableReward(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "userClaimableReward(address)"(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    userMultiplier(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    "userMultiplier(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ackFunds(overrides?: Overrides): Promise<PopulatedTransaction>;

    "ackFunds()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    balanceBefore(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "balanceBefore()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    barn(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "barn()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    claim(overrides?: Overrides): Promise<PopulatedTransaction>;

    "claim()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    currentMultiplier(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "currentMultiplier()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lastPullTs(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "lastPullTs()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "owner()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pullDuration(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "pullDuration()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pullEndAt(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "pullEndAt()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pullStartAt(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "pullStartAt()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pullTokenFrom(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "pullTokenFrom()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pullTotalAmount(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "pullTotalAmount()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    registerUserAction(
      user: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "registerUserAction(address)"(
      user: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    renounceOwnership(overrides?: Overrides): Promise<PopulatedTransaction>;

    "renounceOwnership()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    setBarn(
      _barn: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setBarn(address)"(
      _barn: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setupPullToken(
      source: string,
      startAt: BigNumberish,
      endAt: BigNumberish,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setupPullToken(address,uint256,uint256,uint256)"(
      source: string,
      startAt: BigNumberish,
      endAt: BigNumberish,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    token(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "token()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    userClaimableReward(
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "userClaimableReward(address)"(
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    userMultiplier(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "userMultiplier(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}