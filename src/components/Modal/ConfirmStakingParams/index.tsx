import { FC, useEffect, useMemo, useState } from "react"
import { useWeb3React } from "@web3-react/core"
import {
  Box,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Stack,
} from "@chakra-ui/react"
import { Body1, Body2, Body3, H5 } from "../../Typography"
import withBaseModal from "../withBaseModal"
import TokenBalanceInput from "../../TokenBalanceInput"
import { formatTokenAmount } from "../../../utils/formatAmount"
import { useModal } from "../../../hooks/useModal"
import { BaseModalProps } from "../../../types"
import AdvancedParamsForm from "./AdvancedParamsForm"
import ThresholdCircleBrand from "../../../static/icons/ThresholdCircleBrand"
import { useStakingState } from "../../../hooks/useStakingState"
import { useTokenState } from "../../../hooks/useTokenState"
import { useStakeTransaction } from "../../../web3/hooks/useStakeTransaction"
import { ModalType } from "../../../enums"
import { isAddress } from "ethers/lib/utils"
import { useTStakingContract } from "../../../web3/hooks"
import { BigNumber } from "ethers"
import InfoBox from "../../InfoBox"

const ConfirmStakingParamsModal: FC<
  BaseModalProps & { operatorInUse: boolean }
> = ({ operatorInUse }) => {
  const { closeModal, openModal } = useModal()
  const {
    t: { balance: maxAmount },
  } = useTokenState()
  const { account } = useWeb3React()
  const { stakeAmount, operator, beneficiary, authorizer, updateState } =
    useStakingState()
  const tStakingContract = useTStakingContract()

  const [minTStake, setMinTStake] = useState(BigNumber.from(0))

  useEffect(() => {
    const fetchMinTStake = async () => {
      setMinTStake(await tStakingContract?.minTStake())
    }

    if (tStakingContract?.minTStake) {
      fetchMinTStake()
    }
  }, [])

  const setStakeAmount = (value: string | number) =>
    updateState("stakeAmount", value)
  const setOperator = (value: string) => updateState("operator", value)
  const setBeneficiary = (value: string) => updateState("beneficiary", value)
  const setAuthorizer = (value: string) => updateState("authorizer", value)

  // stake transaction, opens success modal on success callback
  const { stake } = useStakeTransaction((tx) =>
    openModal(ModalType.StakeSuccess, {
      transactionHash: tx.hash,
    })
  )

  const onSubmit = () =>
    stake({ operator, beneficiary, authorizer, amount: stakeAmount })

  //
  // initializes all values to the connected wallet
  //
  useEffect(() => {
    if (account) {
      setOperator(account)
      setBeneficiary(account)
      setAuthorizer(account)
    } else {
      closeModal()
    }
  }, [account])

  const isValidBeneficiary = isAddress(beneficiary)
  const isValidAuthorizer = isAddress(authorizer)
  const isValidOperator = isAddress(operator)
  const isMoreThanMax = BigNumber.from(stakeAmount).gt(
    BigNumber.from(maxAmount)
  )
  const isLessThanMin = BigNumber.from(stakeAmount).lt(minTStake)
  const isZero = stakeAmount == 0

  const disableSubmit = useMemo(() => {
    return (
      isZero ||
      isLessThanMin ||
      isMoreThanMax ||
      !isValidOperator ||
      !isValidBeneficiary ||
      !isValidAuthorizer
    )
  }, [
    stakeAmount,
    maxAmount,
    minTStake,
    isValidOperator,
    isValidBeneficiary,
    isValidAuthorizer,
    isMoreThanMax,
    isLessThanMin,
    isZero,
  ])

  const inputErrorMessage: string = useMemo(() => {
    if (isLessThanMin) {
      return "Amount is less than the minimum stake amount"
    }
    if (isMoreThanMax) {
      return "Amount is larger than your wallet balance"
    }
    return ""
  }, [isLessThanMin, isMoreThanMax])

  return (
    <>
      <ModalHeader>Stake Tokens</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <InfoBox variant="modal">
          <H5 mb={4}>You are about to stake T</H5>
          <Body1>
            Here is some sub text copy to explain the staking process
          </Body1>
        </InfoBox>
        <Stack spacing={6} mb={6}>
          <Box>
            <TokenBalanceInput
              label={`T Amount`}
              amount={stakeAmount}
              setAmount={setStakeAmount}
              max={maxAmount}
              icon={ThresholdCircleBrand}
              mb={2}
            />
            <Body3
              color={inputErrorMessage.length > 0 ? "red.500" : "gray.500"}
            >
              {inputErrorMessage.length > 0
                ? inputErrorMessage
                : `${formatTokenAmount(maxAmount)} T available to stake.`}
            </Body3>
          </Box>
          <Body2>
            Operator, Beneficiary, and Authorizer addresses are currently set
            to: {account}
          </Body2>
          <AdvancedParamsForm
            {...{
              operator,
              setOperator,
              beneficiary,
              setBeneficiary,
              authorizer,
              setAuthorizer,
              isValidAuthorizer,
              isValidBeneficiary,
              isValidOperator,
              operatorInUse,
            }}
          />
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeModal} variant="outline" mr={2}>
          Cancel
        </Button>
        <Button disabled={disableSubmit} onClick={onSubmit}>
          Stake
        </Button>
      </ModalFooter>
    </>
  )
}

export default withBaseModal(ConfirmStakingParamsModal)