import type {
  Company,
  Branch,
  Employee,
  Asset,
  AssetAssignment,
  AssetTransfer,
  AssetType,
  AssetCondition,
  AssetStatus,
  TransferReason,
  User,
} from './types'

// ─── Companies ────────────────────────────────────────────────────────────

export const COMPANIES: Company[] = [
  {
    id: 'vsa',
    name: 'Virtual Security Africa',
    code: 'VSA',
    tagline: "Protecting Africa's Digital Frontiers",
    taglineLine2: 'Providing Cutting-Edge Cybersecurity Solutions Across Africa',
    fullName: 'Virtual Security Africa Ltd.',
    addressGhana: 'Plot 14, Tesano Industrial Area, Accra, Ghana',
    addressUSA: '1234 Innovation Drive, Austin TX 78701, USA',
    phoneGhana: '+233 30 277 8800',
    mobileGhana: '+233 24 411 2098',
    phoneUSA: '+1 512 000 1234',
    email: 'info@virtualsecurity.africa',
    website: 'www.virtualsecurity.africa',
    brandSubtitle: 'Excellence · Innovation · Security',
    authoriserName: 'Bondzie K. Acquah',
    authoriserDesignation: 'Director of Operations',
    waybillSequence: 0,
    logoUrl: null,
  },
  {
    id: 'via',
    name: 'Virtual InfoSec Africa',
    code: 'VIA',
    tagline: "Securing Africa's Information Assets",
    taglineLine2: 'Delivering World-Class Information Security Services',
    fullName: 'Virtual InfoSec Africa Ltd.',
    addressGhana: 'A&C Mall Office Complex, East Legon, Accra, Ghana',
    addressUSA: '',
    phoneGhana: '+233 30 293 4400',
    mobileGhana: '+233 24 512 7733',
    phoneUSA: '',
    email: 'info@virtualinfosec.africa',
    website: 'www.virtualinfosec.africa',
    brandSubtitle: 'Intelligence · Integrity · Impact',
    authoriserName: 'Ama Owusu',
    authoriserDesignation: 'Technical Director',
    waybillSequence: 0,
    logoUrl: null,
  },
]

export const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map(c => [c.id, c])) as Record<string, Company>

// ─── Users ────────────────────────────────────────────────────────────────

export const USERS: User[] = [
  { id: 'u01', name: 'Kwame Asante',  email: 'kwame.asante@virtualsecurity.africa',   active: true, createdAt: '2021-01-01', lastLogin: '2026-05-22' },
  { id: 'u02', name: 'Efua Mensah',   email: 'efua.mensah@virtualsecurity.africa',    active: true, createdAt: '2021-01-01', lastLogin: '2026-05-22' },
  { id: 'u03', name: 'Kojo Boateng',  email: 'kojo.boateng@virtualsecurity.africa',   active: true, createdAt: '2021-01-01', lastLogin: '2026-05-20' },
  { id: 'u04', name: 'Abena Owusu',   email: 'abena.owusu@virtualinfosec.africa',     active: true, createdAt: '2021-01-01', lastLogin: '2026-05-21' },
  { id: 'u05', name: 'Yaw Asiedu',    email: 'yaw.asiedu@virtualinfosec.africa',      active: true, createdAt: '2021-01-01', lastLogin: '2026-05-22' },
]

// ─── Branches ─────────────────────────────────────────────────────────────

export const BRANCHES: Branch[] = [
  { id: 'br01', companyId: 'vsa', name: 'Accra HQ — Tesano', createdAt: '2024-01-01' },
  { id: 'br02', companyId: 'vsa', name: 'Tema Branch',        createdAt: '2024-01-01' },
  { id: 'br03', companyId: 'vsa', name: 'Kumasi Branch',      createdAt: '2024-01-01' },
  { id: 'br04', companyId: 'via', name: 'Accra HQ — Dzorwulu', createdAt: '2024-01-01' },
  { id: 'br05', companyId: 'via', name: 'Takoradi Branch',    createdAt: '2024-01-01' },
  { id: 'br06', companyId: 'via', name: 'BOG Branch',         createdAt: '2024-01-01' },
]

// ─── Employees ────────────────────────────────────────────────────────────

export const EMPLOYEES: Employee[] = [
  { id: 'e01', companyId: 'vsa', branchId: 'br01', employeeId: 'VSA-0142', name: 'Felix Anane',       jobTitle: 'IT Manager',            department: 'Information Technology', email: 'felix.anane@virtualsecurity.africa',    phone: '+233 24 411 2098', joinedAt: '2021-04-12', resignedAt: null,         active: true,  createdAt: '2021-04-12', updatedAt: '2021-04-12' },
  { id: 'e02', companyId: 'vsa', branchId: 'br01', employeeId: 'VSA-0231', name: 'Akua Sarpong',      jobTitle: 'Inventory Officer',      department: 'Operations',             email: 'akua.sarpong@virtualsecurity.africa',   phone: '+233 27 318 8821', joinedAt: '2022-08-01', resignedAt: null,         active: true,  createdAt: '2022-08-01', updatedAt: '2022-08-01' },
  { id: 'e03', companyId: 'vsa', branchId: 'br02', employeeId: 'VSA-0188', name: 'Mark Owusu',        jobTitle: 'Branch Manager',         department: 'Branch Operations',      email: 'mark.owusu@virtualsecurity.africa',     phone: '+233 24 902 4441', joinedAt: '2020-11-03', resignedAt: null,         active: true,  createdAt: '2020-11-03', updatedAt: '2020-11-03' },
  { id: 'e04', companyId: 'vsa', branchId: 'br01', employeeId: 'VSA-0304', name: 'Bondzie K. Acquah', jobTitle: 'Director of Operations', department: 'Executive',              email: 'bondzie.acquah@virtualsecurity.africa', phone: '+233 24 200 1010', joinedAt: '2019-02-18', resignedAt: null,         active: true,  createdAt: '2019-02-18', updatedAt: '2019-02-18' },
  { id: 'e05', companyId: 'vsa', branchId: 'br03', employeeId: 'VSA-0411', name: 'Sandra Adjei',      jobTitle: 'Field Engineer',         department: 'Field Services',         email: 'sandra.adjei@virtualsecurity.africa',   phone: '+233 50 882 1144', joinedAt: '2023-01-15', resignedAt: null,         active: true,  createdAt: '2023-01-15', updatedAt: '2023-01-15' },
  { id: 'e06', companyId: 'vsa', branchId: 'br01', employeeId: 'VSA-0099', name: 'Joseph Tetteh',     jobTitle: 'Junior Technician',      department: 'Information Technology', email: 'joseph.tetteh@virtualsecurity.africa',  phone: '+233 24 311 9042', joinedAt: '2022-06-01', resignedAt: '2025-12-15', active: false, createdAt: '2022-06-01', updatedAt: '2025-12-15' },
  { id: 'e07', companyId: 'via', branchId: 'br04', employeeId: 'VIA-0101', name: 'Ama Owusu',         jobTitle: 'Technical Director',     department: 'Executive',              email: 'ama.owusu@virtualinfosec.africa',       phone: '+233 24 512 7733', joinedAt: '2020-03-01', resignedAt: null,         active: true,  createdAt: '2020-03-01', updatedAt: '2020-03-01' },
  { id: 'e08', companyId: 'via', branchId: 'br04', employeeId: 'VIA-0203', name: 'Selasi Agyemang',   jobTitle: 'SOC Analyst',            department: 'Security Operations',    email: 'selasi.agyemang@virtualinfosec.africa', phone: '+233 24 771 2210', joinedAt: '2023-07-10', resignedAt: null,         active: true,  createdAt: '2023-07-10', updatedAt: '2023-07-10' },
  { id: 'e09', companyId: 'via', branchId: 'br04', employeeId: 'VIA-0178', name: 'Mawuli Tetteh',     jobTitle: 'Network Engineer',       department: 'Infrastructure',         email: 'mawuli.tetteh@virtualinfosec.africa',  phone: '+233 55 192 3344', joinedAt: '2021-09-20', resignedAt: null,         active: true,  createdAt: '2021-09-20', updatedAt: '2021-09-20' },
  { id: 'e10', companyId: 'via', branchId: 'br04', employeeId: 'VIA-0267', name: 'Naa Korkoi',        jobTitle: 'Penetration Tester',     department: 'Security Operations',    email: 'naa.korkoi@virtualinfosec.africa',      phone: '+233 50 644 9981', joinedAt: '2022-11-14', resignedAt: null,         active: true,  createdAt: '2022-11-14', updatedAt: '2022-11-14' },
  { id: 'e11', companyId: 'via', branchId: 'br05', employeeId: 'VIA-0312', name: 'Ibrahim Mohammed',  jobTitle: 'IT Support Specialist',  department: 'Information Technology', email: 'ibrahim.mohammed@virtualinfosec.africa', phone: '+233 24 388 1122', joinedAt: '2024-02-05', resignedAt: null,         active: true,  createdAt: '2024-02-05', updatedAt: '2024-02-05' },
  { id: 'e12', companyId: 'vsa', branchId: 'br01', employeeId: 'VSA-0502', name: 'Daniel Owusu',      jobTitle: 'Operations Coordinator', department: 'Operations',             email: 'daniel.owusu@virtualsecurity.africa',   phone: '+233 27 540 0118', joinedAt: '2023-03-27', resignedAt: null,         active: true,  createdAt: '2023-03-27', updatedAt: '2023-03-27' },
]

// ─── Assets ───────────────────────────────────────────────────────────────

export const ASSETS: Asset[] = [
  { id: 'a01', companyId: 'vsa', branchId: 'br01', assetTag: 'VSA-LT-001', type: 'LAPTOP',  brand: 'Dell',    model: 'Latitude 7440',          serial: 'DLL7440-78XQ4P',    processor: 'Intel Core i7-1355U',   ram: '32GB DDR5',   storage: '1TB NVMe SSD',   operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'Adobe Acrobat', 'Sophos Endpoint', 'Zoom', 'Slack'],  purchaseDate: '2024-08-12', purchasePrice: 18450, warrantyExpiry: '2027-08-12', condition: 'GOOD',         status: 'ASSIGNED',  notes: 'Issued to IT Manager — primary device.',          createdAt: '2024-08-12', updatedAt: '2024-08-22' },
  { id: 'a02', companyId: 'vsa', branchId: 'br01', assetTag: 'VSA-LT-002', type: 'LAPTOP',  brand: 'HP',      model: 'EliteBook 845 G10',      serial: 'HP845G10-RT22A9',   processor: 'AMD Ryzen 7 PRO 7840U', ram: '16GB DDR5',   storage: '512GB NVMe SSD', operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'Sage Accounting', 'Sophos Endpoint'],               purchaseDate: '2024-03-18', purchasePrice: 14200, warrantyExpiry: '2027-03-18', condition: 'GOOD',         status: 'ASSIGNED',  notes: '',                                                createdAt: '2024-03-18', updatedAt: '2024-03-25' },
  { id: 'a03', companyId: 'vsa', branchId: 'br02', assetTag: 'VSA-LT-003', type: 'LAPTOP',  brand: 'Lenovo',  model: 'ThinkPad T14 Gen 4',     serial: 'LNV-T14G4-91PQ22',  processor: 'Intel Core i5-1335U',   ram: '16GB DDR5',   storage: '512GB NVMe SSD', operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'AnyDesk', 'Sophos Endpoint'],                       purchaseDate: '2023-11-09', purchasePrice: 12800, warrantyExpiry: '2026-11-09', condition: 'GOOD',         status: 'ASSIGNED',  notes: 'Branch Manager device.',                          createdAt: '2023-11-09', updatedAt: '2023-11-20' },
  { id: 'a04', companyId: 'vsa', branchId: 'br01', assetTag: 'VSA-LT-004', type: 'LAPTOP',  brand: 'Dell',    model: 'XPS 15 9530',            serial: 'DLLXPS15-K2PL00',   processor: 'Intel Core i9-13900H',  ram: '64GB DDR5',   storage: '2TB NVMe SSD',   operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'Adobe Creative Cloud', 'Sophos Endpoint'],          purchaseDate: '2024-09-30', purchasePrice: 32000, warrantyExpiry: '2027-09-30', condition: 'NEW',          status: 'ASSIGNED',  notes: "Director's device.",                              createdAt: '2024-09-30', updatedAt: '2024-10-08' },
  { id: 'a05', companyId: 'vsa', branchId: 'br03', assetTag: 'VSA-LT-005', type: 'LAPTOP',  brand: 'HP',      model: 'ProBook 450 G10',        serial: 'HPPB450G10-88WW2',  processor: 'Intel Core i5-1335U',   ram: '16GB DDR5',   storage: '512GB NVMe SSD', operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'Sophos Endpoint', 'TeamViewer'],                    purchaseDate: '2024-01-22', purchasePrice: 9800,  warrantyExpiry: '2027-01-22', condition: 'FAIR',         status: 'ASSIGNED',  notes: 'Battery beginning to swell — monitor.',           createdAt: '2024-01-22', updatedAt: '2024-02-04' },
  { id: 'a06', companyId: 'vsa', branchId: 'br01', assetTag: 'VSA-LT-006', type: 'LAPTOP',  brand: 'Dell',    model: 'Latitude 5550',          serial: 'DLL5550-9PXQ7R',    processor: 'Intel Core i7-1355U',   ram: '32GB DDR5',   storage: '512GB NVMe SSD', operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'Sophos Endpoint'],                                 purchaseDate: '2022-04-10', purchasePrice: 10500, warrantyExpiry: '2025-04-10', condition: 'GOOD',         status: 'AVAILABLE', notes: 'Returned by resigned employee — available.',       createdAt: '2022-04-10', updatedAt: '2025-12-15' },
  { id: 'a07', companyId: 'vsa', branchId: 'br01', assetTag: 'VSA-PH-001', type: 'PHONE',   brand: 'Samsung', model: 'Galaxy S24',             serial: 'SMGS24-AX9KR3',     processor: 'Snapdragon 8 Gen 3',    ram: '12GB',        storage: '256GB',          operatingSystem: 'Android 14',     software: ['Microsoft 365 Mobile', 'Sophos Intercept X', 'Zoom'],                purchaseDate: '2024-06-01', purchasePrice: 5200,  warrantyExpiry: '2026-06-01', condition: 'NEW',          status: 'ASSIGNED',  notes: '',                                                createdAt: '2024-06-01', updatedAt: '2024-06-15' },
  { id: 'a08', companyId: 'vsa', branchId: 'br01', assetTag: 'VSA-MN-001', type: 'MONITOR', brand: 'Dell',    model: 'UltraSharp U2723DE',     serial: 'DLLU2723-PQ11X',    processor: undefined,               ram: undefined,     storage: undefined,        operatingSystem: undefined,        software: [],                                                                  purchaseDate: '2024-08-12', purchasePrice: 4200,  warrantyExpiry: '2027-08-12', condition: 'NEW',          status: 'ASSIGNED',  notes: 'Paired with VSA-LT-001 on Felix Anane\'s desk.',  createdAt: '2024-08-12', updatedAt: '2024-08-22' },
  { id: 'a09', companyId: 'vsa', branchId: 'br01', assetTag: 'VSA-LT-007', type: 'LAPTOP',  brand: 'HP',      model: 'EliteBook 840 G8',       serial: 'HPEB840G8-Q7RR11',  processor: 'Intel Core i7-1165G7',  ram: '16GB',        storage: '512GB SSD',      operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'Sophos Endpoint'],                                 purchaseDate: '2021-06-15', purchasePrice: 8900,  warrantyExpiry: '2024-06-15', condition: 'BEYOND_REPAIR', status: 'RETIRED',   notes: 'Cracked screen from site fall. Written off.',      createdAt: '2021-06-15', updatedAt: '2025-08-04' },
  { id: 'a10', companyId: 'vsa', branchId: 'br01', assetTag: 'VSA-TB-001', type: 'TABLET',  brand: 'Apple',   model: 'iPad 10th Gen',          serial: 'APLIPAD10-ZZQ8R1',  processor: 'Apple A14 Bionic',      ram: '4GB',         storage: '64GB',           operatingSystem: 'iPadOS 17',      software: ['Microsoft 365', 'Sophos Intercept X'],                              purchaseDate: '2023-08-04', purchasePrice: 3800,  warrantyExpiry: '2025-08-04', condition: 'GOOD',         status: 'AVAILABLE', notes: 'Spare tablet — available for field assignments.',  createdAt: '2023-08-04', updatedAt: '2023-08-04' },
  { id: 'a11', companyId: 'via', branchId: 'br04', assetTag: 'VIA-LT-001', type: 'LAPTOP',  brand: 'Apple',   model: 'MacBook Pro 14" M3',     serial: 'APMBP14M3-XK99P2',  processor: 'Apple M3 Pro',          ram: '36GB',        storage: '512GB SSD',      operatingSystem: 'macOS Sonoma',   software: ['Xcode', 'Burp Suite Pro', 'Microsoft 365', 'Sophos'],               purchaseDate: '2024-01-15', purchasePrice: 28500, warrantyExpiry: '2027-01-15', condition: 'GOOD',         status: 'ASSIGNED',  notes: 'Primary pentesting machine.',                     createdAt: '2024-01-15', updatedAt: '2025-04-18' },
  { id: 'a12', companyId: 'via', branchId: 'br04', assetTag: 'VIA-LT-002', type: 'LAPTOP',  brand: 'Dell',    model: 'Latitude 7440',          serial: 'DLL7440-VIA-KP04',  processor: 'Intel Core i7-1355U',   ram: '32GB DDR5',   storage: '1TB NVMe SSD',   operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'Wireshark', 'Sophos Endpoint', 'Slack'],           purchaseDate: '2024-04-22', purchasePrice: 18900, warrantyExpiry: '2027-04-22', condition: 'NEW',          status: 'ASSIGNED',  notes: 'SOC analyst primary machine.',                    createdAt: '2024-04-22', updatedAt: '2024-05-01' },
  { id: 'a13', companyId: 'via', branchId: 'br04', assetTag: 'VIA-LT-003', type: 'LAPTOP',  brand: 'Lenovo',  model: 'ThinkPad X1 Carbon G11', serial: 'LNV-X1CG11-88WQ44', processor: 'Intel Core i7-1365U',   ram: '32GB LPDDR5', storage: '1TB NVMe SSD',   operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'Sophos Endpoint', 'AnyDesk'],                       purchaseDate: '2023-12-01', purchasePrice: 22000, warrantyExpiry: '2026-12-01', condition: 'GOOD',         status: 'ASSIGNED',  notes: '',                                                createdAt: '2023-12-01', updatedAt: '2024-01-10' },
  { id: 'a14', companyId: 'via', branchId: 'br04', assetTag: 'VIA-PH-001', type: 'PHONE',   brand: 'Apple',   model: 'iPhone 15 Pro',          serial: 'APLIP15P-VIA-NQ7',  processor: 'Apple A17 Pro',         ram: '8GB',         storage: '256GB',          operatingSystem: 'iOS 17',         software: ['Microsoft 365 Mobile', 'Sophos Intercept X'],                        purchaseDate: '2024-03-10', purchasePrice: 8200,  warrantyExpiry: '2026-03-10', condition: 'NEW',          status: 'ASSIGNED',  notes: '',                                                createdAt: '2024-03-10', updatedAt: '2024-03-15' },
  { id: 'a15', companyId: 'via', branchId: 'br05', assetTag: 'VIA-LT-004', type: 'LAPTOP',  brand: 'HP',      model: 'EliteBook 840 G10',      serial: 'HPEB840G10-TP2200', processor: 'AMD Ryzen 5 PRO 7540U', ram: '16GB DDR5',   storage: '512GB NVMe SSD', operatingSystem: 'Windows 11 Pro', software: ['Microsoft 365', 'Sophos Endpoint', 'TeamViewer'],                    purchaseDate: '2024-05-14', purchasePrice: 13500, warrantyExpiry: '2027-05-14', condition: 'NEW',          status: 'ASSIGNED',  notes: 'Takoradi branch device.',                         createdAt: '2024-05-14', updatedAt: '2024-05-20' },
  { id: 'a16', companyId: 'via', branchId: 'br04', assetTag: 'VIA-MN-001', type: 'MONITOR', brand: 'LG',      model: 'UltraWide 34WP65C-B',    serial: 'LGUW34-VIA-BN8812', processor: undefined,               ram: undefined,     storage: undefined,        operatingSystem: undefined,        software: [],                                                                  purchaseDate: '2023-04-18', purchasePrice: 3100,  warrantyExpiry: '2026-04-18', condition: 'BEYOND_REPAIR', status: 'RETIRED',   notes: 'Dead pixels. Retired 2025-09-21.',                createdAt: '2023-04-18', updatedAt: '2025-09-21' },
]

// ─── Asset Assignments ────────────────────────────────────────────────────

export const ASSET_ASSIGNMENTS: AssetAssignment[] = [
  { id: 'aa01', assetId: 'a01', employeeId: 'e01', assignedAt: '2024-08-22', assignedBy: 'u02', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa02', assetId: 'a02', employeeId: 'e02', assignedAt: '2024-03-25', assignedBy: 'u02', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa03', assetId: 'a03', employeeId: 'e03', assignedAt: '2023-11-20', assignedBy: 'u02', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa04', assetId: 'a04', employeeId: 'e04', assignedAt: '2024-10-08', assignedBy: 'u01', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa05', assetId: 'a05', employeeId: 'e05', assignedAt: '2024-02-04', assignedBy: 'u02', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa06', assetId: 'a06', employeeId: 'e06', assignedAt: '2022-05-01', assignedBy: 'u02', returnedAt: '2025-12-15', returnedBy: 'u01', condition: 'GOOD',    notes: 'Returned on resignation.' },
  { id: 'aa07', assetId: 'a07', employeeId: 'e04', assignedAt: '2024-06-15', assignedBy: 'u01', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa08', assetId: 'a08', employeeId: 'e01', assignedAt: '2024-08-22', assignedBy: 'u02', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa09', assetId: 'a09', employeeId: 'e06', assignedAt: '2022-05-01', assignedBy: 'u02', returnedAt: '2025-08-04', returnedBy: 'u01', condition: 'DAMAGED', notes: 'Cracked screen — beyond repair.' },
  { id: 'aa10', assetId: 'a11', employeeId: 'e10', assignedAt: '2024-02-01', assignedBy: 'u05', returnedAt: '2025-04-18', returnedBy: 'u05', condition: 'GOOD',    notes: 'Upgrade — Selasi inherits.' },
  { id: 'aa11', assetId: 'a11', employeeId: 'e08', assignedAt: '2025-04-18', assignedBy: 'u05', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa12', assetId: 'a12', employeeId: 'e08', assignedAt: '2024-05-01', assignedBy: 'u04', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa13', assetId: 'a13', employeeId: 'e09', assignedAt: '2024-01-10', assignedBy: 'u04', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa14', assetId: 'a14', employeeId: 'e10', assignedAt: '2024-03-15', assignedBy: 'u04', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
  { id: 'aa15', assetId: 'a15', employeeId: 'e11', assignedAt: '2024-05-20', assignedBy: 'u04', returnedAt: null,         returnedBy: null,  condition: undefined, notes: '' },
]

// ─── Asset Transfers ──────────────────────────────────────────────────────

export const ASSET_TRANSFERS: AssetTransfer[] = [
  { id: 't01', referenceNumber: 'VSA/ASSET/001/26', assetId: 'a06', companyId: 'vsa', fromEmployeeId: 'e06', fromCondition: 'GOOD',         returnedAt: '2025-12-15', reason: 'RESIGNATION',   reasonNotes: 'Junior technician resigned to pursue further studies.',              toEmployeeId: null,  assignedAt: null,         processedBy: 'u01', authorisedBy: 'Bondzie K. Acquah', generatedAt: '2025-12-15T16:30:00' },
  { id: 't02', referenceNumber: 'VIA/ASSET/001/26', assetId: 'a11', companyId: 'via', fromEmployeeId: 'e10', fromCondition: 'GOOD',         returnedAt: '2025-04-18', reason: 'UPGRADE',       reasonNotes: 'Naa moving to a refreshed unit; Selasi inherits this one.',          toEmployeeId: 'e08', assignedAt: '2025-04-18', processedBy: 'u05', authorisedBy: 'Ama Owusu',         generatedAt: '2025-04-18T11:14:00' },
  { id: 't03', referenceNumber: 'VSA/ASSET/002/26', assetId: 'a09', companyId: 'vsa', fromEmployeeId: 'e06', fromCondition: 'DAMAGED',      returnedAt: '2025-08-04', reason: 'BEYOND_REPAIR', reasonNotes: 'Cracked screen after fall during a site visit. Sent to Compu-Ghana.', toEmployeeId: null,  assignedAt: null,         processedBy: 'u01', authorisedBy: 'Bondzie K. Acquah', generatedAt: '2025-08-04T09:50:00' },
  { id: 't04', referenceNumber: 'VIA/ASSET/002/26', assetId: 'a16', companyId: 'via', fromEmployeeId: null,  fromCondition: 'BEYOND_REPAIR', returnedAt: null,         reason: 'BEYOND_REPAIR', reasonNotes: 'Panel failure (dead pixels across the screen). Retired.',            toEmployeeId: null,  assignedAt: null,         processedBy: 'u04', authorisedBy: 'Ama Owusu',         generatedAt: '2025-09-21T15:00:00' },
]

// ─── Label maps ───────────────────────────────────────────────────────────

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  LAPTOP:  'Laptop',
  PHONE:   'Phone',
  TABLET:  'Tablet',
  MONITOR: 'Monitor',
  OTHER:   'Other',
}

export const ASSET_TYPE_ICON: Record<AssetType, string> = {
  LAPTOP:  'monitor',
  PHONE:   'phone',
  TABLET:  'tablet',
  MONITOR: 'monitor',
  OTHER:   'package',
}

export const ASSET_CONDITION_LABEL: Record<AssetCondition, string> = {
  NEW:          'New',
  GOOD:         'Good',
  FAIR:         'Fair',
  DAMAGED:      'Damaged',
  BEYOND_REPAIR: 'Beyond Repair',
}

export const ASSET_STATUS_LABEL: Record<AssetStatus, string> = {
  AVAILABLE:    'Available',
  ASSIGNED:     'Assigned',
  UNDER_REPAIR: 'Under Repair',
  RETIRED:      'Retired',
}

export const TRANSFER_REASON_LABEL: Record<TransferReason, string> = {
  RESIGNATION:   'Resignation',
  BEYOND_REPAIR: 'Beyond Repair',
  UPGRADE:       'Upgrade',
  REASSIGNMENT:  'Reassignment',
  OTHER:         'Other',
}

export const TRANSFER_REASON_ICON: Record<TransferReason, string> = {
  RESIGNATION:   'userX',
  BEYOND_REPAIR: 'alert',
  UPGRADE:       'arrowUp',
  REASSIGNMENT:  'swap',
  OTHER:         'more',
}

// ─── Lookup tables ────────────────────────────────────────────────────────

export const BRANCH_BY_ID         = Object.fromEntries(BRANCHES.map(b        => [b.id, b]))  as Record<string, Branch>
export const EMPLOYEE_BY_ID       = Object.fromEntries(EMPLOYEES.map(e       => [e.id, e]))  as Record<string, Employee>
export const ASSET_BY_ID          = Object.fromEntries(ASSETS.map(a          => [a.id, a]))  as Record<string, Asset>
export const ASSET_TRANSFER_BY_ID = Object.fromEntries(ASSET_TRANSFERS.map(t => [t.id, t]))  as Record<string, AssetTransfer>

// ─── Helpers ──────────────────────────────────────────────────────────────

export function fmtCurrency(n?: number | null): string {
  if (n == null) return '—'
  return `GH₵ ${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function daysBetween(a: string, b?: string | null): number {
  const da = new Date(a)
  const db = b ? new Date(b) : new Date('2026-05-22')
  return Math.max(1, Math.round((db.getTime() - da.getTime()) / 86400000))
}
