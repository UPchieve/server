import { OrdersApi, CreateOrderRequest } from 'tremendous'
import { Configuration, Environments } from 'tremendous'
import config from '../config'
import { isProductionEnvironment } from '../utils/environments'

const configuration = new Configuration({
  basePath: isProductionEnvironment()
    ? Environments.production
    : Environments.testflight,
  accessToken: config.tremendousApiKey,
})
const orders = new OrdersApi(configuration)

type CreateGiftCardReward = {
  name: string
  email: string
  method: 'LINK'
  amount: number
  externalId?: string
}

export async function createGiftCardRewardLink(data: CreateGiftCardReward) {
  const params: CreateOrderRequest = {
    payment: {
      funding_source_id: 'BALANCE',
    },
    external_id: data.externalId,
    reward: {
      delivery: {
        method: data.method,
      },
      recipient: {
        name: data.name,
        email: data.email,
      },
      value: {
        denomination: data.amount,
        currency_code: 'USD',
      },
      campaign_id: config.tremendousFallIncentiveCampaign,
    },
  }

  const response = await orders.createOrder(params)
  let rewardLink
  if (response.data.order.rewards)
    rewardLink = response.data.order.rewards[0].delivery?.link
  return rewardLink
}
