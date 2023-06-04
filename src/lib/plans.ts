import Stripe from 'stripe'
import { query } from '../utils/PostgresConnection'
import { pg as sql } from 'yesql'
import { getConfig } from '../utils/config'
import { backfillProducts } from './products'
import { getUniqueIds, upsertMany } from './database_utils'

const config = getConfig()

export const upsertPlans = async (plans: Stripe.Plan[]): Promise<Stripe.Plan[]> => {
  await backfillProducts(getUniqueIds(plans, 'product'))

  return upsertMany('plan', plans)
}

export const deletePlan = async (id: string): Promise<boolean> => {
  
  const prepared = sql(`
    delete from "${config.SCHEMA}"."plans" 
    where id = :id
    returning id;
    `)({ id })
  const { rows } = await query(prepared.text, prepared.values)
  return rows.length > 0
}
