import { PrismaClient } from '@prisma/client'
import { PrismaNeon }   from '@prisma/adapter-neon'
import * as bcrypt      from 'bcryptjs'
import * as dotenv      from 'dotenv'

dotenv.config()

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL_UNPOOLED })
const prisma  = new PrismaClient({ adapter })

const DEFAULT_PASSWORD = 'demo1234'

// ─── Users ────────────────────────────────────────────────────────────────────

const USERS = [
  { name: 'Daniel Sackitey', email: 'dsackitey@virtualinfosecafrica.com', active: true },
]

// ─── Companies ────────────────────────────────────────────────────────────────

const COMPANIES = [
  {
    name:                  'Virtual Security Africa',
    code:                  'VSA',
    tagline:               'Digital Video Security Solutions  |  Access Control Systems  |  Body Armour Security  |  Asset Tracking Systems',
    taglineLine2:          'Fire Alarms & Safety Equipments',
    fullName:              'Virtual Security Africa Limited',
    addressGhana:          "1st Floor, Lami's Plaza, Tesano Gardens, Accra. Behind Alive Chapel",
    addressUSA:            '21638 Dogwood Drive, Matteson, IL 60443',
    phoneGhana:            '021 224643',
    mobileGhana:           '054 2688930',
    phoneUSA:              '+1 773-818-0434',
    email:                 'info@virtualsecurityafrica.com',
    website:               'www.virtualsecurityafrica.com',
    brandSubtitle:         'Security for all…',
    authoriserName:        'Bondzie K. Acquah',
    authoriserDesignation: 'Dir of Operations',
    waybillSequence:       0,
  },
  {
    name:                  'Virtual Infosec Africa',
    code:                  'VIA',
    tagline:               'Cyber Security Consultancy  |  Penetration Testing  |  Managed SOC  |  Compliance & Audit',
    taglineLine2:          'IT Infrastructure & Network Solutions',
    fullName:              'Virtual Infosec Africa Limited',
    addressGhana:          "1st Floor, Lami's Plaza, Tesano Gardens, Accra. Behind Alive Chapel",
    addressUSA:            '21638 Dogwood Drive, Matteson, IL 60443',
    phoneGhana:            '021 224644',
    mobileGhana:           '054 2688931',
    phoneUSA:              '+1 773-818-0435',
    email:                 'info@virtualinfosec.africa',
    website:               'www.virtualinfosec.africa',
    brandSubtitle:         'Securing the digital frontier',
    authoriserName:        'Ama Owusu',
    authoriserDesignation: 'Technical Director',
    waybillSequence:       0,
  },
]

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'HARD_DISK',  label: 'Hard Disk',  isDefault: true  },
  { value: 'SSD',        label: 'SSD',        isDefault: true  },
  { value: 'SERVER',     label: 'Server',     isDefault: true  },
  { value: 'NETWORKING', label: 'Networking', isDefault: true  },
  { value: 'PERIPHERAL', label: 'Peripheral', isDefault: true  },
  { value: 'OTHER',      label: 'Other',      isDefault: false },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Users
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12)
  for (const u of USERS) {
    await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, password: hash, active: u.active },
    })
    console.log(`✓ user:     ${u.name} (${u.email})`)
  }

  // Companies
  for (const c of COMPANIES) {
    await prisma.company.upsert({
      where:  { code: c.code },
      update: c,
      create: c,
    })
    console.log(`✓ company:  ${c.name} (${c.code})`)
  }

  // Categories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where:  { value: cat.value },
      update: { label: cat.label, isDefault: cat.isDefault },
      create: cat,
    })
    console.log(`✓ category: ${cat.label}`)
  }

  console.log(`\nDefault password: ${DEFAULT_PASSWORD}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
