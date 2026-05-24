export interface Company {
  id:                    string
  name:                  string
  code:                  string

  tagline:               string
  taglineLine2:          string
  fullName:              string
  addressGhana:          string
  addressUSA:            string
  phoneGhana:            string
  mobileGhana:           string
  phoneUSA:              string
  email:                 string
  website:               string
  brandSubtitle:         string
  authoriserName:        string
  authoriserDesignation: string
  waybillSequence:       number
  logoUrl:               string | null
}

export interface Category {
  id:        string
  value:     string
  label:     string
  isDefault: boolean
  createdAt: string
}

export type ConditionValue = 'NEW' | 'USED' | 'FAULTY'
export type MovementType   = 'IN' | 'OUT'
export type SerialStatus   = 'IN_STOCK' | 'DISPATCHED'

export interface SerialUnit {
  id:        string
  itemId:    string
  serial:    string
  condition: ConditionValue
  status:    SerialStatus
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id:           string
  companyId:    string
  name:         string
  categoryId:   string
  category:     Category
  brand:        string
  model:        string
  isSerialised: boolean
  serialUnits:  SerialUnit[]   // all units (IN_STOCK + DISPATCHED) for serialised items
  qtyNew:       number         // in-stock counts (derived from serialUnits for serialised)
  qtyUsed:      number
  qtyFaulty:    number
  quantity:     number         // total in stock (computed)
  threshold:    number
  supplier:     string
  purchaseDate: string
  description:  string
  notes:        string
  imageUrl:     string | null
  updated:      string
}

export interface Movement {
  id:                 string
  itemId:             string
  itemName:           string | null
  itemIsSerialised:   boolean
  companyId:          string
  companyCode:        string | null
  type:               MovementType
  waybillNumber:      string | null
  quantity:           number
  serialsDispatched?: string[]
  condBefore:         ConditionValue | null
  condAfter:          ConditionValue | null
  suppliedTo:         string
  destinationCode:    string | null
  driverName:         string
  notes:              string | null
  waybillId:          string | null
  movedBy:            string
  movedAt:            string
  createdAt?:         string
}

export interface Waybill {
  id:              string
  number:          string
  companyId:       string
  date:            string
  suppliedTo:      string
  destinationCode: string
  driverName:      string
  itemIds:         string[]
  generatedBy:     string
  generatedAt:     string
  createdAt?:      string
}

export interface User {
  id:        string
  name:      string
  email:     string
  active:     boolean
  createdAt:  string
  lastLogin:  string | null
  updatedAt?: string
}

export type TweakDensity      = 'compact' | 'comfortable' | 'spacious'
export type TweakDashLayout   = 'split' | 'wide' | 'thirds'
export type TweakStockOutFlow = 'stepper' | 'single'
export type TweakWaybillLayout = 'modern' | 'classic' | 'compact'

export interface Tweaks {
  density:       TweakDensity
  dashLayout:    TweakDashLayout
  stockOutFlow:  TweakStockOutFlow
  waybillLayout: TweakWaybillLayout
}
