/**
 * All the types of integrations that we support.
 */
export type IntegrationType = 'linear' | 'notion'

export interface SendSlackMessageParams {
  message: string
  channel?: string
}
