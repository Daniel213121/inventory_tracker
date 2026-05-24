export interface Line {
  itemId:          string
  qty:             number
  selectedSerials: string[]
}

export interface Details {
  suppliedTo:      string
  destinationCode: string
  driverName:      string
  carNumber:       string
  date:            string
  notes:           string
}
