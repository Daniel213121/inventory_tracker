import type { ConditionValue } from '../../lib/types'

export interface Line {
  itemId:          string
  itemName:        string
  isSerialised:    boolean
  qty:             number
  selectedSerials: string[]
  conditionFrom?:  ConditionValue   // non-serialised only: which bucket to draw from
}

export interface Details {
  suppliedTo:       string
  destinationCode:  string
  deliveryLocation: string
  driverName:       string
  carNumber:        string
  date:             string
  notes:            string
}
