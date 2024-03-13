/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export interface OwnershipForm {
  schemaVersion?: string
  documentType: string
  periodOfReport: string
  dateOfOriginalSubmission?: string
  noSecuritiesOwned?: boolean
  notSubjectToSection16?: boolean
  form3HoldingsReported?: boolean
  form4TransactionsReported?: boolean
  issuer: Issuer
  reportingOwner: ReportingOwner
  aff10B5One?: boolean
  nonDerivativeTable?: NonDerivativeTable
  derivativeTable?: DerivativeTable
  footnotes: Array<Footnote>
  remarks?: string
  ownerSignature: OwnerSignature
}
export interface Issuer {
  cik: string
  name?: string
  tradingSymbol: string
}
export interface ReportingOwner {
  id: ReportingOwnerID
  address?: ReportingOwnerAddress
  relationship?: ReportingOwnerRelationship
}
export interface ReportingOwnerID {
  cik: string
  ccc?: string
  name?: string
}
export interface ReportingOwnerAddress {
  street1?: string
  street2?: string
  city?: string
  state?: string
  zipCode?: string
  stateDescription?: string
}
export interface ReportingOwnerRelationship {
  isDirector?: boolean
  isOfficer?: boolean
  isTenPercentOwner?: boolean
  isOther?: boolean
  officerTitle?: string
  otherText?: string
}
export interface NonDerivativeTable {
  transactions: Array<NonDerivativeTransaction>
  holdings: Array<NonDerivativeHolding>
}
export interface DerivativeTable {
  transactions: Array<DerivativeTransaction>
  holdings: Array<DerivativeHolding>
}
export interface NonDerivativeTransaction {
  securityTitle?: ValueFootnote
  transactionDate?: ValueFootnote
  deemedExecutionDate?: ValueFootnote
  transactionCoding?: TransactionCoding
  transactionTimeliness?: ValueFootnote
  transactionAmounts?: TransactionAmounts
  postTransactionAmounts?: PostTransactionAmounts
  ownershipNature?: OwnershipNature
}
export interface DerivativeTransaction {
  securityTitle?: ValueFootnote
  conversionOrExercisePrice?: ValueFootnote
  deemedExecutionDate?: ValueFootnote
  transactionCoding?: TransactionCoding
  transactionTimeliness?: ValueFootnote
  transactionAmounts?: DerivativeTransactionAmounts
  exerciseDate?: ValueFootnote
  expirationDate?: ValueFootnote
  underlyingSecurity?: UnderlyingSecurity
  postTransactionAmounts?: PostTransactionAmounts
  ownershipNature?: OwnershipNature
}
export interface NonDerivativeHolding {
  securityTitle?: ValueFootnote
  transactionCoding?: HoldingCoding
  postTransactionAmounts?: PostTransactionAmounts
  ownershipNature?: OwnershipNature
}
export interface DerivativeHolding {
  securityTitle?: ValueFootnote
  conversionOrExercisePrice?: ValueFootnote
  transactionCoding?: HoldingCoding
  exerciseDate?: ValueFootnote
  expirationDate?: ValueFootnote
  underlyingSecurity?: UnderlyingSecurity
  postTransactionAmounts?: PostTransactionAmounts
  ownershipNature?: OwnershipNature
}
export interface TransactionCoding {
  formType?: string
  transactionCode?: string
  equitySwapInvolved?: boolean
  footnoteId?: string
}
export interface HoldingCoding {
  formType?: string
  footnoteId?: string
}
export interface TransactionAmounts {
  shares?: ValueFootnote
  pricePerShare?: ValueFootnote
  acquiredDisposedCode?: ValueFootnote
}
export interface DerivativeTransactionAmounts {
  shares?: ValueFootnote
  pricePerShare?: ValueFootnote
  totalValue?: ValueFootnote
  acquiredDisposedCode?: ValueFootnote
}
export interface UnderlyingSecurity {
  title?: ValueFootnote
  shares?: ValueFootnote
  value?: ValueFootnote
}
export interface PostTransactionAmounts {
  sharesOwnedFollowingTransaction?: ValueFootnote
  valueOwnedFollowingTransaction?: ValueFootnote
}
export interface OwnershipNature {
  directOrIndirectOwnership?: ValueFootnote
  natureOfOwnership?: ValueFootnote
}
export interface Footnote {
  id?: string
  note?: string
}
export interface OwnerSignature {
  name: string
  date: string
}
export interface ValueFootnote {
  value?: unknown
  footnoteId?: string
}
export function parseOwnershipForm(form: string): OwnershipForm
export interface Form13F {
  schemaVersion?: string
  headerData: HeaderData
  formData: FormData
}
export interface HeaderData {
  submissionType: string
  filerInfo: FilerInfo
}
export interface FilerInfo {
  liveTestFlag: string
  flags?: Flags
  filer: Filer
  contact?: Contact
  notifications?: Notifications
  periodOfReport: string
}
export interface Flags {
  confirmingCopyFlag?: boolean
  returnCopyFlag?: boolean
  overrideInternetFlag?: boolean
}
export interface Filer {
  credentials: Credentials
  fileNumber?: string
}
export interface Credentials {
  cik: string
  ccc: string
}
export interface Contact {
  name?: string
  phoneNumber?: string
  emailAddress?: string
}
export interface Notifications {
  emailAddress?: string
}
export interface FormData {
  coverPage: CoverPage
  signatureBlock: SignatureBlock
  summaryPage?: SummaryPage
  documents: Array<OtherDocument>
}
export interface CoverPage {
  reportCalendarOrQuarter: string
  isAmendment?: boolean
  amendmentNumber?: number
  amendmentInfo?: AmendmentInfo
  filingManager: FilingManager
  reportType: string
  form13FFileNumber?: string
  otherManagerInfo?: OtherManagerInfo
  provideInfoForInstruction5: boolean
  additionalInformation?: string
}
export interface AmendmentInfo {
  amendmentType?: string
  confDeniedExpired?: boolean
  dataDeniedExpired?: string
  dateReported?: string
  reasonForNonConfidentiality?: string
}
export interface FilingManager {
  name: string
  address: Address
}
export interface Address {
  street1: string
  street2?: string
  city: string
  stateOrCountry: string
  zipCode: string
}
export interface OtherManagerInfo {
  otherManager?: OtherManager
}
export interface OtherManager {
  cik?: string
  name?: string
  form13FFileNumber?: string
}
export interface SignatureBlock {
  name: string
  title: string
  phone: string
  signature: string
  city: string
  stateOrCountry: string
  signatureDate: string
}
export interface SummaryPage {
  otherIncludedManagersCount: number
  tableEntryTotal: number
  tableValueTotal: number
  isConfidentialOmitted?: boolean
  otherManagers: Array<OtherManagerWithSequence>
}
export interface OtherManagerWithSequence {
  sequenceNumber?: number
  manager?: OtherManager
}
export interface OtherDocument {
  conformedName?: string
  conformedDocumentType?: string
  description?: string
  contents?: string
}
export interface Form13FTable {
  entries: Array<TableEntry>
}
export interface TableEntry {
  nameOfIssuer: string
  titleOfClass: string
  cusip: string
  figi?: string
  value: number
  sharesOrPrintAmount: SharesOrPrintAmount
  putCall?: string
  investmentDiscretion: string
  otherManager: Array<number>
  votingAuthority: VotingAuthority
}
export interface SharesOrPrintAmount {
  amount: number
  sharesOrPrintType: string
}
export interface VotingAuthority {
  sole: number
  shared: number
  none: number
}
export function parseForm13F(form: string): Form13F
export function parseForm13FTable(table: string): Form13FTable
export interface Xbrl {
  facts: Array<Fact>
}
export interface Fact {
  context: Context
  concept: string
  value: unknown
  decimals?: string
  unit?: string
}
export interface Context {
  entity: string
  segments: Array<Segment>
  period: Period
}
export interface Segment {
  dimension: string
  member: string
}
export interface Period {
  instant?: string
  startDate?: string
  endDate?: string
}
export function parseXbrl(xbrl: string): Xbrl
