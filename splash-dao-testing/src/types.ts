import {
  GovernanceVeFactoryVeFactory,
  GovernanceVotingEscrowVotingEscrow,
  GovernanceWeightingPollWpFactory,
  TokenInflationInflation,
  TokenSmartFarmFarmFactory,
} from "../plutus.ts";
import { Core } from "@blaze-cardano/sdk";

export type BuiltValidator = {
  script: Core.HexBlob;
  hash: string;
  cost: {
    mem: bigint;
    steps: bigint;
  };
};

export type BuiltPolicy = {
  script: Core.HexBlob;
  policyId: Core.PolicyId;
  assetName: string;
  quantity: bigint;
};

export type ScriptNames =
  | "inflation"
  | "votingEscrow"
  | "farmFactory"
  | "wpFactory"
  | "veFactory"
  | "govProxy"
  | "permManager"
  | "mintWPAuthToken"
  | "mintVEIdentifierToken"
  | "mintVECompositionToken"
  | "weightingPower"
  | "smartFarm";

export type NFTNames =
  | "factory_auth"
  | "gt"
  | "ve_factory_auth"
  | "perm_auth"
  | "proposal_auth"
  | "edao_msig"
  | "inflation_auth"
  | "wp_factory_auth";

export type DeployedValidator = BuiltValidator & {
  referenceUtxoCBOR: Core.HexBlob;
};

// This will be exported in the deployment JSON
export type UTxO = {
  txHash: Core.TransactionId;
  outputIndex: number;
}

export type BuiltValidators = Record<ScriptNames, BuiltValidator>;
export type DeployedValidators = Record<ScriptNames, DeployedValidator>;
export type NFTDetails = Record<NFTNames, BuiltPolicy>;

// Datums for singleton entities

// farm_factory datum
export type FarmState = {
  last_farm_id: number;
  farm_seed_data: string;
};

export type WPFactoryState = {
  /// Epoch of the last WP.
  last_poll_epoch: number;
  /// Active farms.
  active_farms: string[];
};

export type DaoInput = {
  inflation: TokenInflationInflation["epoch"];
  votingEscrow: GovernanceVotingEscrowVotingEscrow["state"];
  farmFactory: TokenSmartFarmFarmFactory["state"];
  wpFactory: GovernanceWeightingPollWpFactory["state"];
  veFactory: GovernanceVeFactoryVeFactory["conf"];
};
