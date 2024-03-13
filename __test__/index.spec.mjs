import test from 'ava'
import fs from 'fs'
import { parseForm13F, parseForm13FTable, parseOwnershipForm, parseXbrl } from '../index.js'

test('parse xbrl-k from native', async (t) => {
  const startTime = Date.now()

  const file = fs.readFileSync('./__test__/data/xbrl-k.xml', 'utf8')
  const result = parseXbrl(file)

  const endTime = Date.now()
  console.log('Parsed XBRL:', endTime - startTime, 'ms')

  t.is(result.facts.length, 1839)

  const firstFact = result.facts[0]
  t.is(firstFact.concept, 'EntityCentralIndexKey')
  t.is(firstFact.value, 789019)

  const context = firstFact.context
  t.is(context.entity, '0000789019')
  t.deepEqual(context.segments, [])

  const period = context.period
  t.is(period.instant, undefined)
  t.is(period.start_date, undefined)
  t.is(period.end_date, undefined)
})

test('parse xbrl-q from native', async (t) => {
  const startTime = Date.now()

  const file = fs.readFileSync('./__test__/data/xbrl-q.xml', 'utf8')
  const result = parseXbrl(file)

  const endTime = Date.now()
  console.log('Parsed XBRL:', endTime - startTime, 'ms')

  t.is(result.facts.length, 1578)

  const firstFact = result.facts[0]
  t.is(firstFact.concept, 'CurrentFiscalYearEndDate')
  t.is(firstFact.value, '--06-30')

  const context = firstFact.context
  t.is(context.entity, '0000789019')
  t.deepEqual(context.segments, [])

  const period = context.period
  t.is(period.instant, undefined)
  t.is(period.start_date, undefined)
  t.is(period.end_date, undefined)
})

test('parse form 13f from native', async (t) => {
  const startTime = Date.now()

  const file = fs.readFileSync('./__test__/data/form13f.xml', 'utf8')
  const result = parseForm13F(file)

  const endTime = Date.now()
  console.log('Parsed Form 13F:', endTime - startTime, 'ms')

  t.is(result.schemaVersion, 'X0202')

  const headerData = result.headerData
  t.is(headerData.submissionType, '13F-HR')

  const filerInfo = headerData.filerInfo
  t.is(filerInfo.periodOfReport, '12-31-2023')
  t.is(filerInfo.liveTestFlag, 'LIVE')
  t.is(filerInfo.filer.credentials.cik, '0001067983')

  const formData = result.formData
  t.is(formData.coverPage.reportCalendarOrQuarter, '12-31-2023')
  t.is(formData.coverPage.isAmendment, false)
  t.is(formData.coverPage.filingManager.name, 'Berkshire Hathaway Inc')

  const signatureBlock = formData.signatureBlock
  t.is(signatureBlock.name, 'Marc D. Hamburg')
  t.is(signatureBlock.title, 'Senior Vice President')
  t.is(signatureBlock.signatureDate, '02-14-2024')

  const summaryPage = formData.summaryPage
  t.is(summaryPage.otherIncludedManagersCount, 14)
  t.is(summaryPage.tableEntryTotal, 138)
  t.is(summaryPage.tableValueTotal, 347358074461)
})

test('parse form 13f table from native', async (t) => {
  const startTime = Date.now()

  const file = fs.readFileSync('./__test__/data/form13f_table.xml', 'utf8')
  const result = parseForm13FTable(file)

  const endTime = Date.now()
  console.log('Parsed Form 13F Table:', endTime - startTime, 'ms')

  t.is(result.entries.length, 138)

  const entry = result.entries[0]
  t.is(entry.nameOfIssuer, 'ALLY FINL INC')
  t.is(entry.titleOfClass, 'COM')
  t.is(entry.cusip, '02005N100')
  t.is(entry.value, 444171051)
  t.is(entry.sharesOrPrintAmount.amount, 12719675)
  t.is(entry.sharesOrPrintAmount.sharesOrPrintType, 'SH')
  t.is(entry.investmentDiscretion, 'DFND')
  t.deepEqual(entry.otherManager, [4])
  t.is(entry.votingAuthority.sole, 12719675)
  t.is(entry.votingAuthority.shared, 0)
  t.is(entry.votingAuthority.none, 0)
})

test('parse form 4 from native', async (t) => {
  const startTime = Date.now()

  const file = fs.readFileSync('./__test__/data/form4.xml', 'utf8')
  const result = parseOwnershipForm(file)

  const endTime = Date.now()
  console.log('Parsed Form 4:', endTime - startTime, 'ms')

  t.is(result.schemaVersion, 'X0508')
  t.is(result.documentType, '4')
  t.is(result.periodOfReport, '2024-03-11')

  t.deepEqual(result.issuer, {
    cik: '0000789019',
    name: 'MICROSOFT CORP',
    tradingSymbol: 'MSFT',
  })

  t.deepEqual(result.reportingOwner, {
    id: { cik: '0001626431', name: 'Hogan Kathleen T' },
    address: {
      street1: 'C/O MICROSOFT CORPORATION',
      street2: 'ONE MICROSOFT WAY',
      city: 'REDMOND',
      state: 'WA',
      zipCode: '98052-6399',
    },
    relationship: {
      isDirector: false,
      isOfficer: true,
      isTenPercentOwner: false,
      isOther: false,
      officerTitle: 'EVP, Chief Human Resources Off',
    },
  })

  t.false(result.aff10B5One)

  t.is(result.nonDerivativeTable.transactions.length, 1)
  t.is(result.nonDerivativeTable.holdings.length, 0)

  t.is(result.footnotes.length, 0)

  t.deepEqual(result.ownerSignature, {
    name: 'Ann Habernigg, Attorney-in-Fact for Kathleen T. Hogan',
    date: '2024-03-12',
  })
})

test('parse form 3 from native', async (t) => {
  const startTime = Date.now()

  const file = fs.readFileSync('./__test__/data/form3.xml', 'utf8')
  const result = parseOwnershipForm(file)

  const endTime = Date.now()
  console.log('Parsed Form 3:', endTime - startTime, 'ms')

  t.is(result.schemaVersion, 'X0206')
  t.is(result.documentType, '3')
  t.is(result.periodOfReport, '2023-11-29')
  t.false(result.noSecuritiesOwned)

  t.deepEqual(result.issuer, {
    cik: '0000789019',
    name: 'MICROSOFT CORP',
    tradingSymbol: 'MSFT',
  })

  t.deepEqual(result.reportingOwner, {
    id: { cik: '0001899931', name: 'Numoto Takeshi' },
    address: {
      street1: 'C/O MICROSOFT CORPORATION',
      street2: 'ONE MICROSOFT WAY',
      city: 'REDMOND',
      state: 'WA',
      zipCode: '98052-6399',
    },
    relationship: {
      isDirector: false,
      isOfficer: true,
      isTenPercentOwner: false,
      isOther: false,
      officerTitle: 'EVP, Chief Marketing Officer',
    },
  })

  t.is(result.nonDerivativeTable.transactions.length, 0)
  t.is(result.nonDerivativeTable.holdings.length, 1)

  t.is(result.footnotes.length, 1)
  t.deepEqual(result.footnotes[0], {
    id: 'F1',
    note: 'Includes an aggregate of 30,746 shares represented by stock awards that vest, subject to continued employment, as follows: 935 shares on 11/30/2023; 4,394 shares on 2/29/2024; 532 shares on 5/30/2024; 403 shares on 5/31/2024; 533 shares on 8/30/2024; 6,570 shares on 8/31/2024; 403 shares on 11/30/2024; 4,245 shares on 2/28/2025; 403 shares on 5/31/2025; 4,246 shares on 8/31/2025; 2,687 shares on 2/28/2026; 2,687 shares on 8/31/2026; 1,354 shares on 2/28/2027; 1,354 shares on 8/31/2027.',
  })

  t.deepEqual(result.ownerSignature, {
    name: 'Ann Habernigg, Attorney-in-Fact for Takeshi Numoto',
    date: '2023-12-01',
  })
})
