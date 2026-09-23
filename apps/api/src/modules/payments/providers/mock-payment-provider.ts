import type { PaymentProvider, PaymentChargeResult } from '../../payments/providers/payment-provider.js'

export class MockPaymentProvider implements PaymentProvider {
  // forceFail est propre au Mock, utile UNIQUEMENT pour tester le chemin
  // d'échec depuis Postman. Un vrai provider (OrangeMoneyProvider) n'aura
  // jamais ce paramètre — sa réussite dépendra du vrai appel réseau.
  constructor(private forceFail = false) {}

  async charge(params: { amountGNF: number; orderId: number }): Promise<PaymentChargeResult> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (this.forceFail) {
      return {
        success: false,
        providerReference: '',
        failureReason: 'Échec simulé (test)',
      }
    }

    return {
      success: true,
      providerReference: `MOCK-${Date.now()}-${params.orderId}`,
    }
  }
}