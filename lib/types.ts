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

export interface InventoryItem {
  id:           string
  companyId:    string
  name:         string
  categoryId:   string
  category:     Category
  brand:        string
  model:        string
  isSerialised: boolean
  serial:       string | null   // primary serial; null for non-serialised items
  serials:      string[]        // all serials; empty for non-serialised
  condition:    ConditionValue
  quantity:     number
  threshold:    number
  supplier:     string
  purchaseDate: string
  description:  string
  notes:        string
  updated:      string
}

export interface Movement {
  id:                 string
  itemId:             string
  companyId:          string
  type:               MovementType
  quantity:           number
  serialsDispatched?: string[]
  condBefore:         ConditionValue | null
  condAfter:          ConditionValue
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
