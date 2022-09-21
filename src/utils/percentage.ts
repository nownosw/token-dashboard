import { BigNumber, BigNumberish, FixedNumber } from "ethers"

export const calculatePercenteage = (
  amount: BigNumberish | undefined,
  totalAmount: BigNumberish | undefined
) => {
  if (
    !amount ||
    BigNumber.from(amount).isZero() ||
    !totalAmount ||
    BigNumber.from(totalAmount).isZero()
  )
    return 0

  return FixedNumber.fromString(amount.toString())
    .divUnsafe(FixedNumber.fromString(totalAmount.toString()))
    .mulUnsafe(FixedNumber.fromString("100"))
    .toUnsafeFloat()
}

export const formatPercentage = (
  percentage: number,
  decimalPlaces: number = 0,
  displayLessThanGreaterThanSigns: boolean = false
): string => {
  if (percentage < 1 && displayLessThanGreaterThanSigns) {
    return "<1%"
  } else if (percentage > 99 && displayLessThanGreaterThanSigns) {
    return ">99%"
  }

  const roundedPercentage = percentage.toFixed(decimalPlaces)

  return `${roundedPercentage.toString()}%`
}
