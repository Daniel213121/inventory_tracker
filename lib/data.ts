import type {
  Company,
  Category,
  InventoryItem,
  Movement,
  Waybill,
  User,
  ConditionValue,
} from './types'

export const COMPANIES: Company[] = [
  {
    id: 'vsa',
    name: 'Virtual Security Africa',
    code: 'VSA',
    tagline: 'Digital Video Security Solutions  |  Access Control Systems  |  Body Armour Security  |  Asset Tracking Systems',
    taglineLine2: 'Fire Alarms & Safety Equipments',
    fullName: 'Virtual Security Africa Limited',
    addressGhana: "1st Floor, Lami's Plaza, Tesano Gardens, Accra. Behind Alive Chapel",
    addressUSA: '21638 Dogwood Drive, Matteson, IL 60443',
    phoneGhana: '021 224643',
    mobileGhana: '054 2688930',
    phoneUSA: '+1 773-818-0434',
    email: 'info@virtualsecurityafrica.com',
    website: 'www.virtualsecurityafrica.com',
    brandSubtitle: 'Security for all…',
    authoriserName: 'Bondzie K. Acquah',
    authoriserDesignation: 'Dir of Operations',
    waybillSequence: 47,
  },
  {
    id: 'via',
    name: 'Virtual Infosec Africa',
    code: 'VIA',
    tagline: 'Cyber Security Consultancy  |  Penetration Testing  |  Managed SOC  |  Compliance & Audit',
    taglineLine2: 'IT Infrastructure & Network Solutions',
    fullName: 'Virtual Infosec Africa Limited',
    addressGhana: "1st Floor, Lami's Plaza, Tesano Gardens, Accra. Behind Alive Chapel",
    addressUSA: '21638 Dogwood Drive, Matteson, IL 60443',
    phoneGhana: '021 224644',
    mobileGhana: '054 2688931',
    phoneUSA: '+1 773-818-0435',
    email: 'info@virtualinfosec.africa',
    website: 'www.virtualinfosec.africa',
    brandSubtitle: 'Securing the digital frontier',
    authoriserName: 'Ama Owusu',
    authoriserDesignation: 'Technical Director',
    waybillSequence: 32,
  },
]

export const CATEGORIES: Category[] = [
  { id: 'cat_hdd',        value: 'HARD_DISK',  label: 'Hard Disk',  isDefault: true,  createdAt: '2025-01-01' },
  { id: 'cat_ssd',        value: 'SSD',        label: 'SSD',        isDefault: true,  createdAt: '2025-01-01' },
  { id: 'cat_server',     value: 'SERVER',     label: 'Server',     isDefault: true,  createdAt: '2025-01-01' },
  { id: 'cat_networking', value: 'NETWORKING', label: 'Networking', isDefault: true,  createdAt: '2025-01-01' },
  { id: 'cat_peripheral', value: 'PERIPHERAL', label: 'Peripheral', isDefault: true,  createdAt: '2025-01-01' },
  { id: 'cat_other',      value: 'OTHER',      label: 'Other',      isDefault: false, createdAt: '2025-01-01' },
]

// Internal lookup used to populate mock inventory items
const _cat: Record<string, Category> = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

export const CONDITIONS: ConditionValue[] = ['NEW', 'USED', 'FAULTY']

export const INVENTORY: InventoryItem[] = [
  {
    id: 'i01', companyId: 'vsa',
    name: 'WD Red Plus 8TB NAS HDD', categoryId: 'cat_hdd', category: _cat['cat_hdd'],
    brand: 'Western Digital', model: 'WD80EFZZ',
    isSerialised: true,
    serial: 'WX12D8KP3RA1',
    serials: ['WX12D8KP3RA1','WX12D8KP3RA2','WX12D8KP3RA3','WX12D8KP3RA4','WX12D8KP3RA5','WX12D8KP3RA6','WX12D8KP3RA7','WX12D8KP3RA8','WX12D8KP3RA9','WX12D8KP3RB1','WX12D8KP3RB2','WX12D8KP3RB3'],
    condition: 'NEW', quantity: 12, threshold: 5,
    supplier: 'Compu-Ghana Ltd', purchaseDate: '2026-03-12',
    description: '7200 RPM, CMR, NAS-rated for 24/7 operation. For surveillance NVR rebuild.',
    notes: 'Allocate to TG-Bank project Q2.', updated: '2026-05-18',
  },
  {
    id: 'i02', companyId: 'vsa',
    name: 'Seagate IronWolf Pro 12TB', categoryId: 'cat_hdd', category: _cat['cat_hdd'],
    brand: 'Seagate', model: 'ST12000NE0008',
    isSerialised: true,
    serial: 'ZL2A87NHQ0',
    serials: ['ZL2A87NHQ0','ZL2A87NHQ1','ZL2A87NHQ2','ZL2A87NHQ3','ZL2A87NHQ4','ZL2A87NHQ5'],
    condition: 'NEW', quantity: 6, threshold: 4,
    supplier: 'Persol Systems', purchaseDate: '2026-02-04',
    description: 'Enterprise NAS HDD, 7200 RPM, 256MB cache.', notes: '', updated: '2026-05-11',
  },
  {
    id: 'i03', companyId: 'vsa',
    name: 'Samsung 870 EVO 1TB SATA SSD', categoryId: 'cat_ssd', category: _cat['cat_ssd'],
    brand: 'Samsung', model: 'MZ-77E1T0B/AM',
    isSerialised: true,
    serial: 'S6PUNS0T901442',
    serials: ['S6PUNS0T901442','S6PUNS0T901443','S6PUNS0T901444','S6PUNS0T901445','S6PUNS0T901446'],
    condition: 'NEW', quantity: 5, threshold: 2,
    supplier: 'Compu-Ghana Ltd', purchaseDate: '2026-04-22',
    description: '2.5" SATA III internal SSD for upgrades.', notes: '', updated: '2026-05-19',
  },
  {
    id: 'i04', companyId: 'vsa',
    name: 'Kingston NV2 500GB NVMe', categoryId: 'cat_ssd', category: _cat['cat_ssd'],
    brand: 'Kingston', model: 'SNV2S/500G',
    isSerialised: true,
    serial: '50026B7785A21CB1',
    serials: ['50026B7785A21CB1','50026B7785A21CB2','50026B7785A21CB3','50026B7785A21CB4'],
    condition: 'NEW', quantity: 4, threshold: 2,
    supplier: 'Persol Systems', purchaseDate: '2026-01-30',
    description: 'M.2 2280 PCIe 4.0 NVMe SSD.', notes: '', updated: '2026-05-09',
  },
  {
    id: 'i05', companyId: 'vsa',
    name: 'Dell PowerEdge R650', categoryId: 'cat_server', category: _cat['cat_server'],
    brand: 'Dell', model: 'R650',
    isSerialised: true,
    serial: 'DLLR650-7HX9P2',
    serials: ['DLLR650-7HX9P2','DLLR650-8KY3Q1'],
    condition: 'NEW', quantity: 2, threshold: 1,
    supplier: 'Dell Ghana', purchaseDate: '2025-11-15',
    description: '1U rack server, 2x Xeon Silver 4314, 128GB RAM.', notes: 'Reserved for SOC build', updated: '2026-04-29',
  },
  {
    id: 'i06', companyId: 'vsa',
    name: 'Dell PowerEdge T440 (refurb)', categoryId: 'cat_server', category: _cat['cat_server'],
    brand: 'Dell', model: 'T440',
    isSerialised: true,
    serial: 'DLLT440-RF02JK',
    serials: ['DLLT440-RF02JK'],
    condition: 'USED', quantity: 1, threshold: 1,
    supplier: 'Internal Transfer', purchaseDate: '2024-08-02',
    description: 'Tower server. Returned from MTN deployment.', notes: 'Needs RAID controller battery', updated: '2026-04-15',
  },
  {
    id: 'i07', companyId: 'vsa',
    name: 'Cisco Catalyst 2960-X 48-port', categoryId: 'cat_networking', category: _cat['cat_networking'],
    brand: 'Cisco', model: 'WS-C2960X-48TS-L',
    isSerialised: true,
    serial: 'FOC2410L5N8',
    serials: ['FOC2410L5N8','FOC2410L5N9','FOC2410L5NA','FOC2410L5NB'],
    condition: 'NEW', quantity: 4, threshold: 2,
    supplier: 'Cisco Partner Direct', purchaseDate: '2025-12-10',
    description: 'Layer 2 managed switch, 48x GbE + 4x SFP.', notes: '', updated: '2026-05-01',
  },
  {
    id: 'i08', companyId: 'vsa',
    name: 'Ubiquiti UniFi 6 LR Access Point', categoryId: 'cat_networking', category: _cat['cat_networking'],
    brand: 'Ubiquiti', model: 'U6-LR-US',
    isSerialised: true,
    serial: 'F4920A1B7C03',
    serials: ['F4920A1B7C03','F4920A1B7C04','F4920A1B7C05'],
    condition: 'NEW', quantity: 3, threshold: 6,
    supplier: 'Compu-Ghana Ltd', purchaseDate: '2026-03-25',
    description: 'WiFi 6 long-range AP.', notes: 'Below threshold — restock', updated: '2026-05-17',
  },
  {
    id: 'i09', companyId: 'vsa',
    name: 'Logitech MK540 Wireless Combo', categoryId: 'cat_peripheral', category: _cat['cat_peripheral'],
    brand: 'Logitech', model: 'MK540 Advanced',
    isSerialised: false,
    serial: null,
    serials: [],
    condition: 'NEW', quantity: 8, threshold: 3,
    supplier: 'Office Supplies GH', purchaseDate: '2026-04-04',
    description: 'Wireless keyboard + mouse combo.', notes: '', updated: '2026-05-12',
  },
  {
    id: 'i10', companyId: 'vsa',
    name: 'Hikvision DS-7716NI-K4 NVR', categoryId: 'cat_other', category: _cat['cat_other'],
    brand: 'Hikvision', model: 'DS-7716NI-K4',
    isSerialised: true,
    serial: 'HKV7716-K4-22B8',
    serials: ['HKV7716-K4-22B8','HKV7716-K4-22B9','HKV7716-K4-22C0','HKV7716-K4-22C1','HKV7716-K4-22C2'],
    condition: 'NEW', quantity: 5, threshold: 2,
    supplier: 'Hikvision MEA', purchaseDate: '2026-02-18',
    description: '16-channel 4K NVR.', notes: '', updated: '2026-05-08',
  },
  {
    id: 'i11', companyId: 'via',
    name: 'Fortinet FortiGate 60F Firewall', categoryId: 'cat_networking', category: _cat['cat_networking'],
    brand: 'Fortinet', model: 'FG-60F',
    isSerialised: true,
    serial: 'FGT60FTK22018A45',
    serials: ['FGT60FTK22018A45','FGT60FTK22018A46','FGT60FTK22018A47','FGT60FTK22018A48','FGT60FTK22018A49','FGT60FTK22018A50'],
    condition: 'NEW', quantity: 6, threshold: 3,
    supplier: 'Fortinet Partner', purchaseDate: '2026-01-22',
    description: 'Next-gen firewall for branch deployments.', notes: '', updated: '2026-05-15',
  },
  {
    id: 'i12', companyId: 'via',
    name: 'HPE ProLiant DL380 Gen11', categoryId: 'cat_server', category: _cat['cat_server'],
    brand: 'HPE', model: 'DL380 Gen11',
    isSerialised: true,
    serial: 'MXQ410028L',
    serials: ['MXQ410028L','MXQ410028M'],
    condition: 'NEW', quantity: 2, threshold: 1,
    supplier: 'HPE Direct', purchaseDate: '2025-10-05',
    description: '2U rack server, 2x Xeon Gold 5418Y, 256GB RAM.', notes: 'SOC build', updated: '2026-04-30',
  },
  {
    id: 'i13', companyId: 'via',
    name: 'Crucial MX500 2TB SSD', categoryId: 'cat_ssd', category: _cat['cat_ssd'],
    brand: 'Crucial', model: 'CT2000MX500SSD1',
    isSerialised: true,
    serial: '2317E76A0F1D',
    serials: ['2317E76A0F1D','2317E76A0F1E','2317E76A0F1F','2317E76A0F20','2317E76A0F21'],
    condition: 'NEW', quantity: 5, threshold: 2,
    supplier: 'Persol Systems', purchaseDate: '2026-03-08',
    description: '2.5" SATA SSD for analyst workstations.', notes: '', updated: '2026-05-10',
  },
  {
    id: 'i14', companyId: 'via',
    name: 'WD Black SN850X 2TB NVMe', categoryId: 'cat_ssd', category: _cat['cat_ssd'],
    brand: 'Western Digital', model: 'WDS200T2X0E',
    isSerialised: true,
    serial: '23496A11DCFE',
    serials: ['23496A11DCFE','23496A11DCFF','23496A11DD00','23496A11DD01'],
    condition: 'NEW', quantity: 4, threshold: 2,
    supplier: 'Compu-Ghana Ltd', purchaseDate: '2026-04-12',
    description: 'M.2 PCIe 4.0 NVMe SSD, 7300 MB/s read.', notes: '', updated: '2026-05-18',
  },
  {
    id: 'i15', companyId: 'via',
    name: 'Toshiba MG09 18TB Enterprise HDD', categoryId: 'cat_hdd', category: _cat['cat_hdd'],
    brand: 'Toshiba', model: 'MG09ACA18TE',
    isSerialised: true,
    serial: 'Y2H0A3CMF95G',
    serials: ['Y2H0A3CMF95G','Y2H0A3CMF95H','Y2H0A3CMF95I','Y2H0A3CMF95J'],
    condition: 'NEW', quantity: 4, threshold: 2,
    supplier: 'Persol Systems', purchaseDate: '2026-02-26',
    description: 'Helium-sealed enterprise HDD for SIEM storage.', notes: '', updated: '2026-05-02',
  },
  {
    id: 'i16', companyId: 'via',
    name: 'Yubikey 5 NFC Hardware Token', categoryId: 'cat_peripheral', category: _cat['cat_peripheral'],
    brand: 'Yubico', model: 'Yubikey 5 NFC',
    isSerialised: false,
    serial: null,
    serials: [],
    condition: 'NEW', quantity: 1, threshold: 10,
    supplier: 'Yubico EU', purchaseDate: '2026-03-14',
    description: 'FIDO2 / U2F hardware authentication token.', notes: 'URGENT: below threshold', updated: '2026-05-19',
  },
  {
    id: 'i17', companyId: 'via',
    name: 'Dell Latitude 5550 (analyst)', categoryId: 'cat_other', category: _cat['cat_other'],
    brand: 'Dell', model: 'Latitude 5550',
    isSerialised: true,
    serial: 'DLL5550-9PXQ7R',
    serials: ['DLL5550-9PXQ7R','DLL5550-9PXQ7S','DLL5550-9PXQ7T'],
    condition: 'USED', quantity: 3, threshold: 2,
    supplier: 'Internal Pool', purchaseDate: '2024-09-19',
    description: 'Analyst loaner laptops. Intel i7-1355U, 32GB RAM.', notes: '', updated: '2026-04-22',
  },
  {
    id: 'i18', companyId: 'via',
    name: 'Cisco Meraki MR46 AP', categoryId: 'cat_networking', category: _cat['cat_networking'],
    brand: 'Cisco', model: 'MR46-HW',
    isSerialised: true,
    serial: 'Q5XB-7K9R-W2NM',
    serials: ['Q5XB-7K9R-W2NM'],
    condition: 'FAULTY', quantity: 1, threshold: 2,
    supplier: 'Meraki RMA', purchaseDate: '2025-06-11',
    description: 'WiFi 6 cloud-managed AP. Failed PoE inrush.', notes: 'RMA pending', updated: '2026-05-05',
  },
  {
    id: 'i19', companyId: 'via',
    name: 'Samsung 870 EVO 1TB SATA SSD', categoryId: 'cat_ssd', category: _cat['cat_ssd'],
    brand: 'Samsung', model: 'MZ-77E1T0B/AM',
    isSerialised: true,
    serial: 'SAM-870-EVO-001',
    serials: ['SAM-870-EVO-001','SAM-870-EVO-002','SAM-870-EVO-003','SAM-870-EVO-004','SAM-870-EVO-005'],
    condition: 'NEW', quantity: 5, threshold: 2,
    supplier: 'Compu-Ghana Ltd', purchaseDate: '2026-05-15',
    description: '2.5" SATA III internal SSD for analyst workstations.', notes: '', updated: '2026-05-15',
  },
  {
    id: 'i20', companyId: 'vsa',
    name: 'Cisco SFP+ 10G SR Transceiver', categoryId: 'cat_networking', category: _cat['cat_networking'],
    brand: 'Cisco', model: 'SFP-10G-SR',
    isSerialised: false,
    serial: null,
    serials: [],
    condition: 'NEW', quantity: 6, threshold: 2,
    supplier: 'Cisco Partner Direct', purchaseDate: '2026-04-28',
    description: '10GBASE-SR SFP+ module, 850nm, 300m on OM3.', notes: '', updated: '2026-04-28',
  },
]

export const MOVEMENTS: Movement[] = [
  {
    id: 'm01', itemId: 'i01', companyId: 'vsa', type: 'OUT', quantity: 4,
    serialsDispatched: ['WX12D8KP3RA1','WX12D8KP3RA2','WX12D8KP3RA3','WX12D8KP3RA4'],
    condBefore: 'NEW', condAfter: 'NEW',
    suppliedTo: 'TG Bank — Head Office', destinationCode: 'TGB',
    driverName: 'Kojo Mensah', notes: 'Phase 1 NVR rebuild', waybillId: 'w01',
    movedBy: 'Akua Sarpong', movedAt: '2026-05-18T09:14:00',
  },
  {
    id: 'm02', itemId: 'i03', companyId: 'vsa', type: 'OUT', quantity: 5,
    serialsDispatched: ['S6PUNS0T901442','S6PUNS0T901443','S6PUNS0T901444','S6PUNS0T901445','S6PUNS0T901446'],
    condBefore: 'NEW', condAfter: 'NEW',
    suppliedTo: 'TG Bank — Head Office', destinationCode: 'TGB',
    driverName: 'Kojo Mensah', notes: 'Phase 1 NVR rebuild', waybillId: 'w01',
    movedBy: 'Akua Sarpong', movedAt: '2026-05-18T09:14:00',
  },
  {
    id: 'm03', itemId: 'i11', companyId: 'via', type: 'OUT', quantity: 2,
    serialsDispatched: ['FGT60FTK22018A45','FGT60FTK22018A46'],
    condBefore: 'NEW', condAfter: 'NEW',
    suppliedTo: 'Stanbic Bank — Airport City', destinationCode: 'STB',
    driverName: 'Ibrahim Mohammed', notes: 'Branch FW refresh', waybillId: 'w02',
    movedBy: 'Akua Sarpong', movedAt: '2026-05-17T14:42:00',
  },
  {
    id: 'm04', itemId: 'i07', companyId: 'vsa', type: 'OUT', quantity: 1,
    serialsDispatched: ['FOC2410L5N8'],
    condBefore: 'NEW', condAfter: 'NEW',
    suppliedTo: 'MTN Ghana — Ridge Tower', destinationCode: 'MTN',
    driverName: 'Yaw Asare', notes: '', waybillId: 'w03',
    movedBy: 'Daniel Owusu', movedAt: '2026-05-16T11:08:00',
  },
  {
    id: 'm05', itemId: 'i14', companyId: 'via', type: 'OUT', quantity: 4,
    serialsDispatched: ['23496A11DCFE','23496A11DCFF','23496A11DD00','23496A11DD01'],
    condBefore: 'NEW', condAfter: 'NEW',
    suppliedTo: 'EcoBank — Independence Ave', destinationCode: 'ECO',
    driverName: 'Ibrahim Mohammed', notes: 'Workstation upgrade', waybillId: 'w04',
    movedBy: 'Akua Sarpong', movedAt: '2026-05-15T15:30:00',
  },
  {
    id: 'm06', itemId: 'i05', companyId: 'vsa', type: 'OUT', quantity: 1,
    serialsDispatched: ['DLLR650-7HX9P2'],
    condBefore: 'NEW', condAfter: 'NEW',
    suppliedTo: 'Ghana Revenue Authority', destinationCode: 'GRA',
    driverName: 'Yaw Asare', notes: 'SOC pilot', waybillId: 'w05',
    movedBy: 'Daniel Owusu', movedAt: '2026-05-14T10:00:00',
  },
  {
    id: 'm07', itemId: 'i12', companyId: 'via', type: 'OUT', quantity: 1,
    serialsDispatched: ['MXQ410028L'],
    condBefore: 'NEW', condAfter: 'NEW',
    suppliedTo: 'Ghana Revenue Authority', destinationCode: 'GRA',
    driverName: 'Yaw Asare', notes: 'SOC pilot', waybillId: 'w06',
    movedBy: 'Daniel Owusu', movedAt: '2026-05-14T10:05:00',
  },
  {
    id: 'm08', itemId: 'i09', companyId: 'vsa', type: 'OUT', quantity: 6,
    serialsDispatched: [],
    condBefore: 'NEW', condAfter: 'NEW',
    suppliedTo: 'TG Bank — Tema Branch', destinationCode: 'TGB',
    driverName: 'Kojo Mensah', notes: 'End-user kits', waybillId: 'w07',
    movedBy: 'Akua Sarpong', movedAt: '2026-05-13T09:50:00',
  },
  {
    id: 'm09', itemId: 'i01', companyId: 'vsa', type: 'IN', quantity: 12,
    condBefore: null, condAfter: 'NEW',
    suppliedTo: 'Compu-Ghana Ltd (PO 4421)', destinationCode: null,
    driverName: 'Compu-Ghana Logistics', notes: 'Restock', waybillId: null,
    movedBy: 'Daniel Owusu', movedAt: '2026-05-12T08:30:00',
  },
  {
    id: 'm10', itemId: 'i06', companyId: 'vsa', type: 'IN', quantity: 1,
    condBefore: 'NEW', condAfter: 'USED',
    suppliedTo: 'MTN Ghana — return', destinationCode: null,
    driverName: 'Yaw Asare', notes: 'Returned after deployment, needs inspection', waybillId: null,
    movedBy: 'Daniel Owusu', movedAt: '2026-05-11T16:18:00',
  },
  {
    id: 'm11', itemId: 'i18', companyId: 'via', type: 'IN', quantity: 1,
    condBefore: 'NEW', condAfter: 'FAULTY',
    suppliedTo: 'Stanbic Bank — return', destinationCode: null,
    driverName: 'Ibrahim Mohammed', notes: 'PoE issue, RMA pending', waybillId: null,
    movedBy: 'Akua Sarpong', movedAt: '2026-05-05T13:22:00',
  },
  {
    id: 'm12', itemId: 'i08', companyId: 'vsa', type: 'IN', quantity: 6,
    condBefore: null, condAfter: 'NEW',
    suppliedTo: 'Compu-Ghana Ltd (PO 4413)', destinationCode: null,
    driverName: 'Compu-Ghana Logistics', notes: 'Restock APs', waybillId: null,
    movedBy: 'Daniel Owusu', movedAt: '2026-05-02T10:11:00',
  },
  {
    id: 'm13', itemId: 'i16', companyId: 'via', type: 'IN', quantity: 10,
    condBefore: null, condAfter: 'NEW',
    suppliedTo: 'Yubico EU (DHL)', destinationCode: null,
    driverName: 'DHL Express', notes: 'Tokens for analyst onboarding', waybillId: null,
    movedBy: 'Akua Sarpong', movedAt: '2026-04-28T11:00:00',
  },
]

export const WAYBILLS: Waybill[] = [
  { id: 'w01', number: 'VSA/TGB/2026/02', companyId: 'vsa', date: '2026-05-18', suppliedTo: 'TG Bank — Head Office',        destinationCode: 'TGB', driverName: 'Kojo Mensah',      itemIds: ['m01','m02'], generatedBy: 'Akua Sarpong', generatedAt: '2026-05-18T09:14:00' },
  { id: 'w02', number: 'VIA/STB/2026/01', companyId: 'via', date: '2026-05-17', suppliedTo: 'Stanbic Bank — Airport City',  destinationCode: 'STB', driverName: 'Ibrahim Mohammed', itemIds: ['m03'],       generatedBy: 'Akua Sarpong', generatedAt: '2026-05-17T14:42:00' },
  { id: 'w03', number: 'VSA/MTN/2026/01', companyId: 'vsa', date: '2026-05-16', suppliedTo: 'MTN Ghana — Ridge Tower',      destinationCode: 'MTN', driverName: 'Yaw Asare',        itemIds: ['m04'],       generatedBy: 'Daniel Owusu', generatedAt: '2026-05-16T11:08:00' },
  { id: 'w04', number: 'VIA/ECO/2026/01', companyId: 'via', date: '2026-05-15', suppliedTo: 'EcoBank — Independence Ave',   destinationCode: 'ECO', driverName: 'Ibrahim Mohammed', itemIds: ['m05'],       generatedBy: 'Akua Sarpong', generatedAt: '2026-05-15T15:30:00' },
  { id: 'w05', number: 'VSA/GRA/2026/01', companyId: 'vsa', date: '2026-05-14', suppliedTo: 'Ghana Revenue Authority',      destinationCode: 'GRA', driverName: 'Yaw Asare',        itemIds: ['m06'],       generatedBy: 'Daniel Owusu', generatedAt: '2026-05-14T10:00:00' },
  { id: 'w06', number: 'VIA/GRA/2026/01', companyId: 'via', date: '2026-05-14', suppliedTo: 'Ghana Revenue Authority',      destinationCode: 'GRA', driverName: 'Yaw Asare',        itemIds: ['m07'],       generatedBy: 'Daniel Owusu', generatedAt: '2026-05-14T10:05:00' },
  { id: 'w07', number: 'VSA/TGB/2026/01', companyId: 'vsa', date: '2026-05-13', suppliedTo: 'TG Bank — Tema Branch',        destinationCode: 'TGB', driverName: 'Kojo Mensah',      itemIds: ['m08'],       generatedBy: 'Akua Sarpong', generatedAt: '2026-05-13T09:50:00' },
]

export const USERS: User[] = [
  { id: 'u01', name: 'Akua Sarpong',    email: 'akua.sarpong@virtualsecurity.africa',    active: true,  createdAt: '2025-09-04', lastLogin: '2026-05-19T08:14:00' },
  { id: 'u02', name: 'Daniel Owusu',    email: 'daniel.owusu@virtualsecurity.africa',    active: true,  createdAt: '2025-09-04', lastLogin: '2026-05-19T07:42:00' },
  { id: 'u03', name: 'Kwame Boateng',   email: 'kwame.boateng@virtualsecurity.africa',   active: true,  createdAt: '2025-07-12', lastLogin: '2026-05-18T17:09:00' },
  { id: 'u04', name: 'Ama Owusu',       email: 'ama.owusu@virtualinfosec.africa',        active: true,  createdAt: '2025-07-12', lastLogin: '2026-05-18T19:33:00' },
  { id: 'u05', name: 'Selasi Agyemang', email: 'selasi.agyemang@virtualinfosec.africa',  active: true,  createdAt: '2025-11-22', lastLogin: '2026-05-17T11:20:00' },
  { id: 'u06', name: 'Joseph Tetteh',   email: 'joseph.tetteh@virtualsecurity.africa',   active: false, createdAt: '2024-04-01', lastLogin: '2025-12-18T09:00:00' },
]

/* ─── Lookup Maps ────────────────────────────────────────────────────────────── */

export const CONDITION_LABEL: Record<string, string> = {
  NEW:    'New',
  USED:   'Used',
  FAULTY: 'Faulty',
}

export const ITEM_BY_ID     = Object.fromEntries(INVENTORY.map(i  => [i.id, i]))  as Record<string, InventoryItem>
export const COMPANY_BY_ID  = Object.fromEntries(COMPANIES.map(c  => [c.id, c]))  as Record<string, Company>
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))  as Record<string, Category>
export const USER_BY_ID     = Object.fromEntries(USERS.map(u      => [u.id, u]))  as Record<string, User>
export const WAYBILL_BY_ID  = Object.fromEntries(WAYBILLS.map(w   => [w.id, w]))  as Record<string, Waybill>
export const MOVEMENT_BY_ID = Object.fromEntries(MOVEMENTS.map(m  => [m.id, m]))  as Record<string, Movement>

/* ─── Format Helpers ─────────────────────────────────────────────────────────── */

export function fmtDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateShort(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export function fmtWaybillDate(d: string | Date): string {
  const date  = typeof d === 'string' ? new Date(d) : d
  const day   = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-GB', { month: 'long' }).toUpperCase()
  const year  = date.getFullYear()
  return `${day} ${month} ${year}`
}
