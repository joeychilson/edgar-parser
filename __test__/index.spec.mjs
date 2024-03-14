import test from 'ava'
import fs from 'fs'
import { parseForm13F, parseForm13FTable, parseOwnershipForm, parseXbrl } from '../index.js'

test('parse 8k from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc8k.xml', 'utf8')
  const result = parseXbrl(file)
  const endTime = Date.now()
  t.log('Parsed 8K:', endTime - startTime, 'ms')

  t.is(result.facts.length, 29)

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

test('parse 10k from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc10k.xml', 'utf8')
  const result = parseXbrl(file)
  const endTime = Date.now()
  t.log('Parsed 10K:', endTime - startTime, 'ms')

  t.is(result.facts.length, 3460)

  const firstFact = result.facts[0]
  t.is(firstFact.concept, 'DocumentFiscalPeriodFocus')
  t.is(firstFact.value, 'FY')

  const context = firstFact.context
  t.is(context.entity, '0001067983')
  t.deepEqual(context.segments, [])

  const period = context.period
  t.is(period.instant, undefined)
  t.is(period.start_date, undefined)
  t.is(period.end_date, undefined)
})

test('parse 10q from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc10q.xml', 'utf8')
  const result = parseXbrl(file)
  const endTime = Date.now()
  t.log('Parsed 10Q:', endTime - startTime, 'ms')

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

test('parse form 3 from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc3.xml', 'utf8')
  const result = parseOwnershipForm(file)
  const endTime = Date.now()
  t.log('Parsed Form 3:', endTime - startTime, 'ms')

  t.is(result.documentType, '3')
  t.is(result.periodOfReport, '2002-09-15')

  t.deepEqual(result.issuer, { cik: '1212121212', tradingSymbol: 'AWI' })

  t.is(result.reportingOwners.length, 1)
  t.deepEqual(result.reportingOwners[0], {
    id: { cik: '343434', ccc: 'a#ofc0rn' },
    address: {
      street1: '123 Main St',
      street2: 'Apt #44',
      city: 'Anywhere',
      state: 'VA',
      zipCode: '21212',
    },
    relationship: {
      isDirector: true,
      isOfficer: true,
      isTenPercentOwner: false,
      isOther: true,
      officerTitle: 'President and CEO',
      otherText: 'Public Affairs Officer',
    },
  })

  t.is(result.nonDerivativeTable.holdings.length, 1)
  t.deepEqual(result.nonDerivativeTable.holdings[0], {
    securityTitle: { value: 'Preferred Stock Options', footnoteIds: ['F1'] },
    postTransactionAmounts: {
      sharesOwnedFollowingTransaction: { value: 33333, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
      natureOfOwnership: { value: '', footnoteIds: [] },
    },
  })

  t.is(result.derivativeTable.holdings.length, 1)
  t.deepEqual(result.derivativeTable.holdings[0], {
    securityTitle: { value: 'Derived Stock (HOLDING)', footnoteIds: [] },
    conversionOrExercisePrice: { value: 50.55, footnoteIds: ['F5'] },
    exerciseDate: { footnoteIds: ['F2'] },
    expirationDate: { value: '1980-12-25', footnoteIds: ['F4'] },
    underlyingSecurity: {
      title: { value: 'Derived Stock (HOLDING)', footnoteIds: [] },
      value: { value: 100.12, footnoteIds: ['F3'] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
    },
  })

  t.is(result.footnotes.length, 5)
  t.deepEqual(result.footnotes[0], { id: 'F1', note: 'Footnote 1.' })

  t.is(result.remarks, 'This is just a general comment.')

  t.is(result.ownerSignatures.length, 3)
  t.deepEqual(result.ownerSignatures[0], { name: 'Jane Doe', date: '2002-11-23' })
})

test('parse form 3/A from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc3a.xml', 'utf8')
  const result = parseOwnershipForm(file)
  const endTime = Date.now()
  t.log('Parsed Form 3/A:', endTime - startTime, 'ms')

  t.is(result.documentType, '3/A')
  t.is(result.periodOfReport, '2002-09-15')
  t.is(result.dateOfOriginalSubmission, '2003-03-01')

  t.deepEqual(result.issuer, { cik: '1212121212', tradingSymbol: 'AWI' })

  t.is(result.reportingOwners.length, 1)
  t.deepEqual(result.reportingOwners[0], {
    id: { cik: '343434', ccc: 'a#ofc0rn' },
    address: {
      street1: '123 Main St',
      street2: 'Apt #44',
      city: 'Anywhere',
      state: 'VA',
      zipCode: '21212',
    },
    relationship: {
      isDirector: true,
      isOfficer: true,
      isTenPercentOwner: false,
      isOther: true,
      officerTitle: 'President and CEO',
      otherText: 'Public Affairs Officer',
    },
  })

  t.is(result.nonDerivativeTable.holdings.length, 1)
  t.deepEqual(result.nonDerivativeTable.holdings[0], {
    securityTitle: { value: 'Preferred Stock Options', footnoteIds: ['F1'] },
    postTransactionAmounts: {
      sharesOwnedFollowingTransaction: { value: 33333, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
      natureOfOwnership: { value: '', footnoteIds: [] },
    },
  })

  t.is(result.derivativeTable.holdings.length, 1)
  t.deepEqual(result.derivativeTable.holdings[0], {
    securityTitle: { value: 'Derived Stock (HOLDING)', footnoteIds: [] },
    conversionOrExercisePrice: { value: 50.55, footnoteIds: ['F5'] },
    exerciseDate: { footnoteIds: ['F2'] },
    expirationDate: { value: '1980-12-25', footnoteIds: ['F4'] },
    underlyingSecurity: {
      title: { value: 'Derived Stock (HOLDING)', footnoteIds: [] },
      value: { value: 100.12, footnoteIds: ['F3'] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
    },
  })

  t.is(result.footnotes.length, 5)
  t.deepEqual(result.footnotes[0], { id: 'F1', note: 'Footnote 1.' })

  t.is(result.remarks, 'This is just a general comment.')

  t.is(result.ownerSignatures.length, 3)
  t.deepEqual(result.ownerSignatures[0], { name: 'Jane Doe', date: '2002-11-23' })
})

test('parse form 4 from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc4.xml', 'utf8')
  const result = parseOwnershipForm(file)
  const endTime = Date.now()
  t.log('Parsed Form 4:', endTime - startTime, 'ms')

  t.is(result.documentType, '4')
  t.is(result.periodOfReport, '2003-09-15')
  t.true(result.notSubjectToSection16)

  t.deepEqual(result.issuer, { cik: '1212121212', tradingSymbol: 'AWI' })

  t.is(result.reportingOwners.length, 2)
  t.deepEqual(result.reportingOwners[0], {
    id: { cik: '0000343434', ccc: 'a#ofc0rn' },
    address: {
      street1: '123 Main St',
      street2: 'Apt #44',
      city: 'Anywhere',
      state: 'VA',
      zipCode: '21212',
    },
    relationship: {
      isDirector: true,
      isOfficer: true,
      isTenPercentOwner: false,
      isOther: true,
      officerTitle: 'President and CEO',
      otherText: 'Public Affairs Officer',
    },
  })

  t.true(result.aff10B5One)

  t.is(result.nonDerivativeTable.transactions.length, 2)
  t.deepEqual(result.nonDerivativeTable.transactions[0], {
    securityTitle: { value: 'Common Stock', footnoteIds: [] },
    transactionDate: { value: '2002-11-01', footnoteIds: [] },
    deemedExecutionDate: { value: '2002-11-02', footnoteIds: [] },
    transactionCoding: {
      formType: '5',
      transactionCode: 'J',
      equitySwapInvolved: true,
      footnoteIds: ['F1', 'F2', 'F3'],
    },
    transactionTimeliness: { value: '', footnoteIds: ['F3'] },
    transactionAmounts: {
      shares: { value: 2000, footnoteIds: [] },
      pricePerShare: { value: 0, footnoteIds: [] },
      acquiredDisposedCode: { value: 'A', footnoteIds: [] },
    },
    postTransactionAmounts: {
      sharesOwnedFollowingTransaction: { value: 999, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'I', footnoteIds: [] },
      natureOfOwnership: { value: 'This describes the nature of the ownership.', footnoteIds: [] },
    },
  })

  t.is(result.nonDerivativeTable.holdings.length, 2)
  t.deepEqual(result.nonDerivativeTable.holdings[1], {
    securityTitle: { value: 'Common Stock Options', footnoteIds: [] },
    postTransactionAmounts: {
      valueOwnedFollowingTransaction: { value: 2222.33, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'I', footnoteIds: [] },
      natureOfOwnership: { value: 'Owned Indirectly', footnoteIds: [] },
    },
  })

  t.is(result.derivativeTable.holdings.length, 1)
  t.is(result.derivativeTable.transactions.length, 1)
  t.deepEqual(result.derivativeTable.transactions[0], {
    securityTitle: { value: 'Derived Stock (HOLDING)', footnoteIds: ['F1', 'F3'] },
    conversionOrExercisePrice: { value: 50.55, footnoteIds: ['F5'] },
    transactionDate: { value: '1980-12-25', footnoteIds: [] },
    transactionCoding: {
      formType: '4',
      transactionCode: 'C',
      equitySwapInvolved: false,
      footnoteIds: [],
    },
    transactionAmounts: {
      shares: { value: 0, footnoteIds: [] },
      pricePerShare: { value: 1001.23, footnoteIds: ['F2'] },
      acquiredDisposedCode: { value: 'A', footnoteIds: [] },
    },
    exerciseDate: { value: '1980-12-25', footnoteIds: [] },
    expirationDate: { value: '1980-12-25', footnoteIds: ['F4'] },
    underlyingSecurity: {
      title: { value: 'Derived Stock (HOLDING)', footnoteIds: [] },
      value: { value: 100.12, footnoteIds: [] },
    },
    postTransactionAmounts: {
      valueOwnedFollowingTransaction: { value: 3210.88, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
    },
  })

  t.is(result.footnotes.length, 5)
  t.deepEqual(result.footnotes[0], { id: 'F1', note: 'Footnote 1.' })

  t.is(result.remarks, 'This is just a general comment.')

  t.is(result.ownerSignatures.length, 3)
  t.deepEqual(result.ownerSignatures[0], { name: 'Jane Doe', date: '2002-11-23' })
})

test('parse form 4/A from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc4a.xml', 'utf8')
  const result = parseOwnershipForm(file)
  const endTime = Date.now()
  t.log('Parsed Form 4/A:', endTime - startTime, 'ms')

  t.is(result.documentType, '4/A')
  t.is(result.periodOfReport, '2003-09-15')
  t.is(result.dateOfOriginalSubmission, '2003-03-01')
  t.true(result.notSubjectToSection16)

  t.deepEqual(result.issuer, { cik: '1212121212', tradingSymbol: 'AWI' })

  t.is(result.reportingOwners.length, 2)
  t.deepEqual(result.reportingOwners[0], {
    id: { cik: '0000343434', ccc: 'a#ofc0rn' },
    address: {
      street1: '123 Main St',
      street2: 'Apt #44',
      city: 'Anywhere',
      state: 'VA',
      zipCode: '21212',
    },
    relationship: {
      isDirector: true,
      isOfficer: true,
      isTenPercentOwner: false,
      isOther: true,
      officerTitle: 'President and CEO',
      otherText: 'Public Affairs Officer',
    },
  })

  t.true(result.aff10B5One)

  t.is(result.nonDerivativeTable.transactions.length, 2)
  t.deepEqual(result.nonDerivativeTable.transactions[0], {
    securityTitle: { value: 'Common Stock', footnoteIds: [] },
    transactionDate: { value: '2002-11-01', footnoteIds: [] },
    deemedExecutionDate: { value: '2002-11-02', footnoteIds: [] },
    transactionCoding: {
      formType: '5',
      transactionCode: 'J',
      equitySwapInvolved: true,
      footnoteIds: ['F1', 'F2', 'F3'],
    },
    transactionTimeliness: { value: '', footnoteIds: ['F3'] },
    transactionAmounts: {
      shares: { value: 2000, footnoteIds: [] },
      pricePerShare: { value: 0, footnoteIds: [] },
      acquiredDisposedCode: { value: 'A', footnoteIds: [] },
    },
    postTransactionAmounts: {
      sharesOwnedFollowingTransaction: { value: 999, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'I', footnoteIds: [] },
      natureOfOwnership: { value: 'This describes the nature of the ownership.', footnoteIds: [] },
    },
  })

  t.is(result.nonDerivativeTable.holdings.length, 2)
  t.deepEqual(result.nonDerivativeTable.holdings[1], {
    securityTitle: { value: 'Common Stock Options', footnoteIds: [] },
    postTransactionAmounts: {
      valueOwnedFollowingTransaction: { value: 2222.33, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'I', footnoteIds: [] },
      natureOfOwnership: { value: 'Owned Indirectly', footnoteIds: [] },
    },
  })

  t.is(result.derivativeTable.holdings.length, 1)
  t.is(result.derivativeTable.transactions.length, 1)
  t.deepEqual(result.derivativeTable.transactions[0], {
    securityTitle: { value: 'Derived Stock (HOLDING)', footnoteIds: ['F1', 'F3'] },
    conversionOrExercisePrice: { value: 50.55, footnoteIds: ['F5'] },
    transactionDate: { value: '1980-12-25', footnoteIds: [] },
    transactionCoding: {
      formType: '4',
      transactionCode: 'C',
      equitySwapInvolved: false,
      footnoteIds: [],
    },
    transactionAmounts: {
      shares: { value: 0, footnoteIds: [] },
      pricePerShare: { value: 1001.23, footnoteIds: ['F2'] },
      acquiredDisposedCode: { value: 'A', footnoteIds: [] },
    },
    exerciseDate: { value: '1980-12-25', footnoteIds: [] },
    expirationDate: { value: '1980-12-25', footnoteIds: ['F4'] },
    underlyingSecurity: {
      title: { value: 'Derived Stock (HOLDING)', footnoteIds: [] },
      value: { value: 100.12, footnoteIds: [] },
    },
    postTransactionAmounts: {
      valueOwnedFollowingTransaction: { value: 3210.88, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
    },
  })

  t.is(result.footnotes.length, 5)
  t.deepEqual(result.footnotes[0], { id: 'F1', note: 'Footnote 1.' })

  t.is(result.remarks, 'This is just a general comment.')

  t.is(result.ownerSignatures.length, 3)
  t.deepEqual(result.ownerSignatures[0], { name: 'Jane Doe', date: '2002-11-23' })
})

test('parse form 5 from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc5.xml', 'utf8')
  const result = parseOwnershipForm(file)
  const endTime = Date.now()
  t.log('Parsed Form 5:', endTime - startTime, 'ms')

  t.is(result.documentType, '5')
  t.is(result.periodOfReport, '2002-09-15')
  t.true(result.notSubjectToSection16)

  t.deepEqual(result.issuer, { cik: '1212121212', tradingSymbol: 'AWI' })

  t.is(result.reportingOwners.length, 2)
  t.deepEqual(result.reportingOwners[0], {
    id: { cik: '0000343434', ccc: 'a#ofc0rn' },
    address: {
      street1: '123 Main St',
      street2: 'Apt #44',
      city: 'Anywhere',
      state: 'VA',
      zipCode: '21212',
    },
    relationship: {
      isDirector: true,
      isOfficer: true,
      isTenPercentOwner: false,
      isOther: true,
      officerTitle: 'President and CEO',
      otherText: 'Public Affairs Officer',
    },
  })

  t.true(result.aff10B5One)

  t.is(result.nonDerivativeTable.transactions.length, 3)
  t.deepEqual(result.nonDerivativeTable.transactions[0], {
    securityTitle: { value: 'Common Stock', footnoteIds: [] },
    transactionDate: { value: '2003-05-01', footnoteIds: [] },
    transactionCoding: {
      formType: '5',
      transactionCode: 'A',
      equitySwapInvolved: true,
      footnoteIds: ['F4', 'F5'],
    },
    transactionAmounts: {
      shares: { value: 2000, footnoteIds: [] },
      pricePerShare: { value: 120, footnoteIds: [] },
      acquiredDisposedCode: { value: 'D', footnoteIds: [] },
    },
    postTransactionAmounts: {
      sharesOwnedFollowingTransaction: { value: 22000, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'I', footnoteIds: ['F3'] },
      natureOfOwnership: { value: 'This describes the nature of the ownership.', footnoteIds: [] },
    },
  })

  t.is(result.nonDerivativeTable.holdings.length, 1)
  t.deepEqual(result.nonDerivativeTable.holdings[0], {
    securityTitle: { value: 'Preferred Stock Options', footnoteIds: ['F1'] },
    postTransactionAmounts: {
      sharesOwnedFollowingTransaction: { value: 33333, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
      natureOfOwnership: { value: '', footnoteIds: [] },
    },
  })

  t.is(result.derivativeTable.holdings.length, 1)
  t.is(result.derivativeTable.transactions.length, 1)
  t.deepEqual(result.derivativeTable.transactions[0], {
    securityTitle: { value: 'Derived Stock (HOLDING)', footnoteIds: ['F1', 'F3'] },
    conversionOrExercisePrice: { value: 50.55, footnoteIds: ['F5'] },
    transactionDate: { value: '1980-12-25', footnoteIds: [] },
    transactionCoding: {
      formType: '5',
      transactionCode: 'C',
      equitySwapInvolved: false,
      footnoteIds: [],
    },
    transactionAmounts: {
      totalValue: { value: 500000, footnoteIds: ['F2'] },
      pricePerShare: { value: 1001.23, footnoteIds: ['F3'] },
      acquiredDisposedCode: { value: 'A', footnoteIds: [] },
    },
    exerciseDate: { value: '1980-12-25', footnoteIds: [] },
    expirationDate: { value: '1980-12-25', footnoteIds: ['F4'] },
    underlyingSecurity: {
      title: { value: 'Derived Stock (HOLDING)', footnoteIds: [] },
      value: { value: 100.12, footnoteIds: [] },
    },
    postTransactionAmounts: {
      valueOwnedFollowingTransaction: { value: 3210.88, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
    },
  })

  t.is(result.footnotes.length, 5)
  t.deepEqual(result.footnotes[0], { id: 'F1', note: 'Footnote 1.' })

  t.is(result.remarks, 'This is just a general comment.')

  t.is(result.ownerSignatures.length, 3)
  t.deepEqual(result.ownerSignatures[0], { name: 'Jane Doe', date: '2002-11-23' })
})

test('parse form 5/A from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc5a.xml', 'utf8')
  const result = parseOwnershipForm(file)
  const endTime = Date.now()
  t.log('Parsed Form 5/A:', endTime - startTime, 'ms')

  t.is(result.documentType, '5/A')
  t.is(result.periodOfReport, '2002-09-15')
  t.is(result.dateOfOriginalSubmission, '2003-03-01')
  t.true(result.notSubjectToSection16)

  t.deepEqual(result.issuer, { cik: '1212121212', tradingSymbol: 'AWI' })

  t.is(result.reportingOwners.length, 2)
  t.deepEqual(result.reportingOwners[0], {
    id: { cik: '0000343434', ccc: 'a#ofc0rn' },
    address: {
      street1: '123 Main St',
      street2: 'Apt #44',
      city: 'Anywhere',
      state: 'VA',
      zipCode: '21212',
    },
    relationship: {
      isDirector: true,
      isOfficer: true,
      isTenPercentOwner: false,
      isOther: true,
      officerTitle: 'President and CEO',
      otherText: 'Public Affairs Officer',
    },
  })

  t.true(result.aff10B5One)

  t.is(result.nonDerivativeTable.transactions.length, 3)
  t.deepEqual(result.nonDerivativeTable.transactions[0], {
    securityTitle: { value: 'Common Stock', footnoteIds: [] },
    transactionDate: { value: '2003-05-01', footnoteIds: [] },
    transactionCoding: {
      formType: '5',
      transactionCode: 'A',
      equitySwapInvolved: true,
      footnoteIds: ['F4', 'F5'],
    },
    transactionAmounts: {
      shares: { value: 2000, footnoteIds: [] },
      pricePerShare: { value: 120, footnoteIds: [] },
      acquiredDisposedCode: { value: 'D', footnoteIds: [] },
    },
    postTransactionAmounts: {
      sharesOwnedFollowingTransaction: { value: 22000, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'I', footnoteIds: ['F3'] },
      natureOfOwnership: { value: 'This describes the nature of the ownership.', footnoteIds: [] },
    },
  })

  t.is(result.nonDerivativeTable.holdings.length, 1)
  t.deepEqual(result.nonDerivativeTable.holdings[0], {
    securityTitle: { value: 'Preferred Stock Options', footnoteIds: ['F1'] },
    postTransactionAmounts: {
      sharesOwnedFollowingTransaction: { value: 33333, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
      natureOfOwnership: { value: '', footnoteIds: [] },
    },
  })

  t.is(result.derivativeTable.holdings.length, 1)
  t.is(result.derivativeTable.transactions.length, 1)
  t.deepEqual(result.derivativeTable.transactions[0], {
    securityTitle: { value: 'Derived Stock (HOLDING)', footnoteIds: ['F1', 'F3'] },
    conversionOrExercisePrice: { value: 50.55, footnoteIds: ['F5'] },
    transactionDate: { value: '1980-12-25', footnoteIds: [] },
    transactionCoding: {
      formType: '5',
      transactionCode: 'C',
      equitySwapInvolved: false,
      footnoteIds: [],
    },
    transactionAmounts: {
      totalValue: { value: 500000, footnoteIds: ['F2'] },
      pricePerShare: { value: 1001.23, footnoteIds: ['F3'] },
      acquiredDisposedCode: { value: 'A', footnoteIds: [] },
    },
    exerciseDate: { value: '1980-12-25', footnoteIds: [] },
    expirationDate: { value: '1980-12-25', footnoteIds: ['F4'] },
    underlyingSecurity: {
      title: { value: 'Derived Stock (HOLDING)', footnoteIds: [] },
      value: { value: 100.12, footnoteIds: [] },
    },
    postTransactionAmounts: {
      valueOwnedFollowingTransaction: { value: 3210.88, footnoteIds: [] },
    },
    ownershipNature: {
      directOrIndirectOwnership: { value: 'D', footnoteIds: [] },
    },
  })

  t.is(result.footnotes.length, 5)
  t.deepEqual(result.footnotes[0], { id: 'F1', note: 'Footnote 1.' })

  t.is(result.remarks, 'This is just a general comment.')

  t.is(result.ownerSignatures.length, 3)
  t.deepEqual(result.ownerSignatures[0], { name: 'Jane Doe', date: '2002-11-23' })
})

test('parse form 13f-ctr from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc13f-ctr.xml', 'utf8')
  const result = parseForm13F(file)
  const endTime = Date.now()
  t.log('Parsed form 13f-ctr:', endTime - startTime, 'ms')

  const headerData = result.headerData
  t.deepEqual(headerData, {
    submissionType: '13F-CTR',
    filerInfo: {
      contact: {
        name: 'qweq',
        emailAddress: 'qweqw@yahoo.com',
        phoneNumber: '222-222-2222',
      },
      filer: {
        credentials: { cik: '0123456789', ccc: '********' },
      },
      flags: {
        confirmingCopyFlag: false,
        overrideInternetFlag: false,
        returnCopyFlag: false,
      },
      liveTestFlag: 'LIVE',
      periodOfReport: '12-31-2021',
    },
  })

  const formData = result.formData
  t.deepEqual(formData, {
    coverPage: {
      reportType: '13F HOLDINGS REPORT',
      reportCalendarOrQuarter: '12-31-2021',
      crdNumber: 777777777,
      secFileNumber: '333-78445',
      provideInfoForInstruction5: false,
      filingManager: {
        name: 'TEST',
        address: {
          street1: 'TEST LANE AA EFDFSDF',
          street2: 'ERY',
          city: 'L',
          stateOrCountry: 'CT',
          zipCode: '22222',
        },
      },
    },
    signatureBlock: {
      name: 'werwr',
      title: 'werer',
      phone: '222-222-2222',
      signature: 'dsfsd',
      city: 'adsd',
      stateOrCountry: 'AZ',
      signatureDate: '11-03-2020',
    },
    summaryPage: {
      otherIncludedManagersCount: 0,
      tableEntryTotal: 111,
      tableValueTotal: 1111,
      otherManagers: [],
    },
    documents: [],
  })
})

test('parse form 13f-ctra from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc13f-ctra.xml', 'utf8')
  const result = parseForm13F(file)
  const endTime = Date.now()
  t.log('Parsed form 13f-ctr:', endTime - startTime, 'ms')

  const headerData = result.headerData
  t.deepEqual(headerData, {
    submissionType: '13F-CTR/A',
    filerInfo: {
      contact: {
        name: 'sdfs',
        emailAddress: 'sdf@yahoo.com',
        phoneNumber: '222-222-2222',
      },
      filer: {
        credentials: { cik: '0123456789', ccc: '********' },
      },
      flags: {
        confirmingCopyFlag: false,
        overrideInternetFlag: false,
        returnCopyFlag: false,
      },
      liveTestFlag: 'LIVE',
      periodOfReport: '12-31-2021',
      denovoRequest: true,
    },
  })

  const formData = result.formData
  t.deepEqual(formData, {
    coverPage: {
      reportType: '13F HOLDINGS REPORT',
      reportCalendarOrQuarter: '12-31-2021',
      crdNumber: 777777777,
      secFileNumber: '333-785445',
      isAmendment: true,
      amendmentNumber: 11,
      provideInfoForInstruction5: false,
      filingManager: {
        name: 'BIG FUND TRUST inc',
        address: {
          street1: 'TEST LANE AA EFDFSDF',
          street2: 'ERY',
          city: 'L',
          stateOrCountry: 'CT',
          zipCode: '22222',
        },
      },
    },
    signatureBlock: {
      name: 'dsfsd',
      title: 'sdff',
      phone: '222-222-2222',
      signature: 'sdfs',
      city: 'fsdf',
      stateOrCountry: 'AK',
      signatureDate: '11-09-2021',
    },
    summaryPage: {
      otherIncludedManagersCount: 0,
      tableEntryTotal: 111,
      tableValueTotal: 111,
      otherManagers: [],
    },
    documents: [],
  })
})

test('parse form 13f-hr from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc13f-hr.xml', 'utf8')
  const result = parseForm13F(file)
  const endTime = Date.now()
  t.log('Parsed form 13f-hr:', endTime - startTime, 'ms')

  const headerData = result.headerData
  t.deepEqual(headerData, {
    submissionType: '13F-HR',
    filerInfo: {
      liveTestFlag: 'LIVE',
      flags: {
        confirmingCopyFlag: false,
        returnCopyFlag: false,
        overrideInternetFlag: false,
      },
      filer: {
        credentials: {
          cik: '0123456789',
          ccc: '********',
        },
      },
      contact: {
        name: 'SDAD',
        emailAddress: 'ASDA@yahoo.com',
        phoneNumber: '222-222-2222',
      },
      periodOfReport: '12-31-2021',
    },
  })

  const formData = result.formData
  t.deepEqual(formData, {
    coverPage: {
      reportCalendarOrQuarter: '12-31-2021',
      filingManager: {
        name: 'BIG FUND TRUST inc',
        address: {
          street1: 'TEST LANE AA EFDFSDF',
          street2: 'ERY',
          city: 'L',
          stateOrCountry: 'CT',
          zipCode: '22222',
        },
      },
      reportType: '13F HOLDINGS REPORT',
      crdNumber: 777777777,
      secFileNumber: '333-78545',
      provideInfoForInstruction5: false,
    },
    signatureBlock: {
      name: 'eqwqwe',
      title: 'asdsad',
      phone: '222-222-2222',
      signature: 'asdasd',
      city: 'asdd',
      stateOrCountry: 'AZ',
      signatureDate: '11-02-2021',
    },
    summaryPage: {
      otherIncludedManagersCount: 0,
      tableEntryTotal: 111,
      tableValueTotal: 111,
      isConfidentialOmitted: false,
      otherManagers: [],
    },
    documents: [],
  })
})

test('parse form 13f-hra from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc13f-hra.xml', 'utf8')
  const result = parseForm13F(file)
  const endTime = Date.now()
  t.log('Parsed form 13f-hra:', endTime - startTime, 'ms')

  const headerData = result.headerData
  t.deepEqual(headerData, {
    submissionType: '13F-HR/A',
    filerInfo: {
      liveTestFlag: 'LIVE',
      flags: {
        confirmingCopyFlag: false,
        returnCopyFlag: false,
        overrideInternetFlag: false,
      },
      filer: {
        credentials: {
          cik: '0123456789',
          ccc: '********',
        },
      },
      contact: {
        name: 'asdsa',
        emailAddress: 'sds@yahoo.com',
        phoneNumber: '222-788-7777',
      },
      periodOfReport: '12-31-2021',
    },
  })

  const formData = result.formData
  t.deepEqual(formData, {
    coverPage: {
      reportCalendarOrQuarter: '12-31-2021',
      isAmendment: true,
      amendmentNumber: 45,
      amendmentInfo: {
        amendmentType: 'RESTATEMENT',
      },
      filingManager: {
        name: 'BIG FUND TRUST inc',
        address: {
          street1: 'TEST LANE AA EFDFSDF',
          street2: 'ERY',
          city: 'L',
          stateOrCountry: 'CT',
          zipCode: '22222',
        },
      },
      reportType: '13F HOLDINGS REPORT',
      crdNumber: 777777777,
      secFileNumber: '333-78548',
      provideInfoForInstruction5: false,
    },
    signatureBlock: {
      name: 'dewrwe',
      title: 'werwerwe',
      phone: '22-785-77884',
      signature: 'dfsdf',
      city: 'sdfsdf',
      stateOrCountry: 'GA',
      signatureDate: '11-01-2021',
    },
    summaryPage: {
      otherIncludedManagersCount: 0,
      tableEntryTotal: 1222,
      tableValueTotal: 1122,
      isConfidentialOmitted: false,
      otherManagers: [],
    },
    documents: [],
  })
})

test('parse form 13f-nt from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc13f-nt.xml', 'utf8')
  const result = parseForm13F(file)
  const endTime = Date.now()
  t.log('Parsed form 13f-nt:', endTime - startTime, 'ms')

  const headerData = result.headerData
  t.deepEqual(headerData, {
    submissionType: '13F-NT',
    filerInfo: {
      liveTestFlag: 'LIVE',
      flags: {
        confirmingCopyFlag: false,
        returnCopyFlag: false,
        overrideInternetFlag: false,
      },
      filer: {
        credentials: {
          cik: '0123456789',
          ccc: '********',
        },
      },
      contact: {
        name: 'asdad',
        emailAddress: 'asdad@yahoo.com',
        phoneNumber: '222-222-2222',
      },
      periodOfReport: '12-31-2021',
    },
  })

  const formData = result.formData
  t.deepEqual(formData, {
    coverPage: {
      reportCalendarOrQuarter: '12-31-2021',
      filingManager: {
        name: 'BIG FUND TRUST inc',
        address: {
          street1: 'TEST LANE AA EFDFSDF',
          street2: 'ERY',
          city: 'L',
          stateOrCountry: 'CT',
          zipCode: '22222',
        },
      },
      reportType: '13F NOTICE',
      crdNumber: 777777777,
      secFileNumber: '333-77777',
      otherManagersInfo: {
        otherManager: {
          name: 'BIG FUND TRUST inc',
          cik: '0123456789',
          form13FFileNumber: '028-7844',
          crdNumber: 785474547,
          secFileNumber: '333-78547',
        },
      },
      provideInfoForInstruction5: false,
    },
    signatureBlock: {
      name: 'sdfs',
      title: 'sdf',
      phone: '222-222-2222',
      signature: 'fdd',
      city: 'fd',
      stateOrCountry: 'AK',
      signatureDate: '11-01-2021',
    },
    documents: [],
  })
})

test('parse form 13f-nt/a from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc13f-nta.xml', 'utf8')
  const result = parseForm13F(file)
  const endTime = Date.now()
  t.log('Parsed form 13f-nt/a:', endTime - startTime, 'ms')

  const headerData = result.headerData
  t.deepEqual(headerData, {
    submissionType: '13F-NT/A',
    filerInfo: {
      liveTestFlag: 'LIVE',
      flags: {
        confirmingCopyFlag: false,
        returnCopyFlag: false,
        overrideInternetFlag: false,
      },
      filer: {
        credentials: {
          cik: '0123456789',
          ccc: '********',
        },
      },
      contact: {
        name: 'erere',
        emailAddress: 'sdfsdf@yahoo.com',
        phoneNumber: '222-222-2222',
      },
      periodOfReport: '12-31-2021',
    },
  })

  const formData = result.formData
  t.deepEqual(formData, {
    coverPage: {
      reportCalendarOrQuarter: '12-31-2021',
      isAmendment: true,
      amendmentNumber: 12,
      filingManager: {
        name: 'BIG FUND TRUST inc',
        address: {
          street1: 'TEST LANE AA EFDFSDF',
          street2: 'ERY',
          city: 'L',
          stateOrCountry: 'CT',
          zipCode: '22222',
        },
      },
      reportType: '13F NOTICE',
      crdNumber: 777777777,
      secFileNumber: '333-78545',
      otherManagersInfo: {
        otherManager: {
          cik: '0123456789',
          crdNumber: 777777777,
          form13FFileNumber: '028-54444',
          name: 'BIG FUND TRUST inc',
          secFileNumber: '333-78544',
        },
      },
      provideInfoForInstruction5: false,
    },
    signatureBlock: {
      name: 'fdgdf',
      title: 'dfgdf',
      phone: '222-222-2222',
      signature: 'sdff',
      city: 'sdfsdf',
      stateOrCountry: 'AR',
      signatureDate: '11-09-2021',
    },
    documents: [],
  })
})

test('parse form 13f-table from native', async (t) => {
  const startTime = Date.now()
  const file = fs.readFileSync('./__test__/data/doc13f-table.xml', 'utf8')
  const result = parseForm13FTable(file)
  const endTime = Date.now()
  t.log('Parsed form 13f-table:', endTime - startTime, 'ms')

  t.is(result.entries.length, 169)

  const entry = result.entries[0]
  t.deepEqual(entry, {
    nameOfIssuer: 'AT&T INC',
    titleOfClass: 'COM',
    cusip: '02079K107',
    figi: '02079K107743',
    value: 7454547777,
    sharesOrPrintAmount: {
      amount: 79296,
      sharesOrPrintType: 'SH',
    },
    investmentDiscretion: 'SOLE',
    votingAuthority: {
      sole: 0,
      shared: 0,
      none: 79296,
    },
    otherManager: [],
  })
})
