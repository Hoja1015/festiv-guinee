export interface PaymentChargeResult {
  success: boolean
  providerReference: string
  failureReason?: string
}

export interface PaymentProvider {
  charge(params: { amountGNF: number; orderId: number }): Promise<PaymentChargeResult>
}

