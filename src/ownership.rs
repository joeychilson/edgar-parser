use napi::Env;
use napi::Error;
use napi::JsUnknown;
use napi_derive::napi;
use roxmltree::{Document as XMLDoc, Node};

use crate::get_bool;
use crate::get_string;
use crate::parse_value;

#[napi(object)]
pub struct OwnershipForm {
  pub schema_version: Option<String>,
  pub document_type: String,
  pub period_of_report: String,
  pub date_of_original_submission: Option<String>,
  pub no_securities_owned: Option<bool>,
  pub not_subject_to_section_16: Option<bool>,
  pub form3_holdings_reported: Option<bool>,
  pub form4_transactions_reported: Option<bool>,
  pub issuer: Issuer,
  pub reporting_owner: ReportingOwner,
  pub aff10b5_one: Option<bool>,
  pub non_derivative_table: Option<NonDerivativeTable>,
  pub derivative_table: Option<DerivativeTable>,
  pub footnotes: Vec<Footnote>,
  pub remarks: Option<String>,
  pub owner_signature: OwnerSignature,
}

#[napi(object)]
pub struct Issuer {
  pub cik: String,
  pub name: Option<String>,
  pub trading_symbol: String,
}

#[napi(object)]
pub struct ReportingOwner {
  pub id: ReportingOwnerID,
  pub address: Option<ReportingOwnerAddress>,
  pub relationship: Option<ReportingOwnerRelationship>,
}

#[napi(object)]
pub struct ReportingOwnerID {
  pub cik: String,
  pub ccc: Option<String>,
  pub name: Option<String>,
}

#[napi(object)]
pub struct ReportingOwnerAddress {
  pub street1: Option<String>,
  pub street2: Option<String>,
  pub city: Option<String>,
  pub state: Option<String>,
  pub zip_code: Option<String>,
  pub state_description: Option<String>,
}

#[napi(object)]
pub struct ReportingOwnerRelationship {
  pub is_director: Option<bool>,
  pub is_officer: Option<bool>,
  pub is_ten_percent_owner: Option<bool>,
  pub is_other: Option<bool>,
  pub officer_title: Option<String>,
  pub other_text: Option<String>,
}

#[napi(object)]
pub struct NonDerivativeTable {
  pub transactions: Vec<NonDerivativeTransaction>,
  pub holdings: Vec<NonDerivativeHolding>,
}

#[napi(object)]
pub struct DerivativeTable {
  pub transactions: Vec<DerivativeTransaction>,
  pub holdings: Vec<DerivativeHolding>,
}

#[napi(object)]
pub struct NonDerivativeTransaction {
  pub security_title: Option<ValueFootnote>,
  pub transaction_date: Option<ValueFootnote>,
  pub deemed_execution_date: Option<ValueFootnote>,
  pub transaction_coding: Option<TransactionCoding>,
  pub transaction_timeliness: Option<ValueFootnote>,
  pub transaction_amounts: Option<TransactionAmounts>,
  pub post_transaction_amounts: Option<PostTransactionAmounts>,
  pub ownership_nature: Option<OwnershipNature>,
}

#[napi(object)]
pub struct DerivativeTransaction {
  pub security_title: Option<ValueFootnote>,
  pub conversion_or_exercise_price: Option<ValueFootnote>,
  pub deemed_execution_date: Option<ValueFootnote>,
  pub transaction_coding: Option<TransactionCoding>,
  pub transaction_timeliness: Option<ValueFootnote>,
  pub transaction_amounts: Option<DerivativeTransactionAmounts>,
  pub exercise_date: Option<ValueFootnote>,
  pub expiration_date: Option<ValueFootnote>,
  pub underlying_security: Option<UnderlyingSecurity>,
  pub post_transaction_amounts: Option<PostTransactionAmounts>,
  pub ownership_nature: Option<OwnershipNature>,
}

#[napi(object)]
pub struct NonDerivativeHolding {
  pub security_title: Option<ValueFootnote>,
  pub transaction_coding: Option<HoldingCoding>,
  pub post_transaction_amounts: Option<PostTransactionAmounts>,
  pub ownership_nature: Option<OwnershipNature>,
}

#[napi(object)]
pub struct DerivativeHolding {
  pub security_title: Option<ValueFootnote>,
  pub conversion_or_exercise_price: Option<ValueFootnote>,
  pub transaction_coding: Option<HoldingCoding>,
  pub exercise_date: Option<ValueFootnote>,
  pub expiration_date: Option<ValueFootnote>,
  pub underlying_security: Option<UnderlyingSecurity>,
  pub post_transaction_amounts: Option<PostTransactionAmounts>,
  pub ownership_nature: Option<OwnershipNature>,
}

#[napi(object)]
pub struct TransactionCoding {
  pub form_type: Option<String>,
  pub transaction_code: Option<String>,
  pub equity_swap_involved: Option<bool>,
  pub footnote_id: Option<String>,
}

#[napi(object)]
pub struct HoldingCoding {
  pub form_type: Option<String>,
  pub footnote_id: Option<String>,
}

#[napi(object)]
pub struct TransactionAmounts {
  pub shares: Option<ValueFootnote>,
  pub price_per_share: Option<ValueFootnote>,
  pub acquired_disposed_code: Option<ValueFootnote>,
}

#[napi(object)]
pub struct DerivativeTransactionAmounts {
  pub shares: Option<ValueFootnote>,
  pub price_per_share: Option<ValueFootnote>,
  pub total_value: Option<ValueFootnote>,
  pub acquired_disposed_code: Option<ValueFootnote>,
}

#[napi(object)]
pub struct UnderlyingSecurity {
  pub title: Option<ValueFootnote>,
  pub shares: Option<ValueFootnote>,
  pub value: Option<ValueFootnote>,
}

#[napi(object)]
pub struct PostTransactionAmounts {
  pub shares_owned_following_transaction: Option<ValueFootnote>,
  pub value_owned_following_transaction: Option<ValueFootnote>,
}

#[napi(object)]
pub struct OwnershipNature {
  pub direct_or_indirect_ownership: Option<ValueFootnote>,
  pub nature_of_ownership: Option<ValueFootnote>,
}

#[napi(object)]
pub struct Footnote {
  pub id: Option<String>,
  pub note: Option<String>,
}

#[napi(object)]
pub struct OwnerSignature {
  pub name: String,
  pub date: String,
}

#[napi(object)]
pub struct ValueFootnote {
  pub value: Option<JsUnknown>,
  pub footnote_id: Option<String>,
}

#[napi]
pub fn parse_ownership_form(env: Env, form: String) -> Result<OwnershipForm, Error> {
  let doc = XMLDoc::parse(&form).map_err(|e| Error::from_reason(e.to_string()))?;
  let root_node = doc.root_element();
  let schema_version = get_string(&root_node, "schemaVersion").ok();
  let document_type = get_string(&root_node, "documentType").map_err(Error::from_reason)?;
  let period_of_report = get_string(&root_node, "periodOfReport").map_err(Error::from_reason)?;
  let date_of_original_submission = get_string(&root_node, "dateOfOriginalSubmission").ok();
  let no_securities_owned = get_bool(&root_node, "noSecuritiesOwned").ok();
  let not_subject_to_section_16 = get_bool(&root_node, "notSubjectToSection16").ok();
  let form3_holdings_reported = get_bool(&root_node, "form3HoldingsReported").ok();
  let form4_transactions_reported = get_bool(&root_node, "form4TransactionsReported").ok();
  let aff10b5_one = get_bool(&root_node, "aff10b5One").ok();
  let issuer = parse_issuer(&root_node).map_err(Error::from_reason)?;
  let reporting_owner = parse_reporting_owner(&root_node).map_err(Error::from_reason)?;
  let non_derivative_table =
    parse_non_derivative_table(env, &root_node).map_err(Error::from_reason)?;
  let derivative_table = parse_derivative_table(env, &root_node).map_err(Error::from_reason)?;
  let footnotes = parse_footnotes(&root_node).map_err(Error::from_reason)?;
  let remarks = get_string(&root_node, "remarks").ok();
  let owner_signature = parse_owner_signature(&root_node).map_err(Error::from_reason)?;

  Ok(OwnershipForm {
    schema_version,
    document_type,
    period_of_report,
    date_of_original_submission,
    no_securities_owned,
    not_subject_to_section_16,
    form3_holdings_reported,
    form4_transactions_reported,
    issuer,
    reporting_owner,
    aff10b5_one,
    non_derivative_table,
    derivative_table,
    footnotes,
    remarks,
    owner_signature,
  })
}

fn parse_issuer(node: &roxmltree::Node) -> Result<Issuer, String> {
  node
    .children()
    .find(|node| node.has_tag_name("issuer"))
    .ok_or("issuer not found".to_string())
    .and_then(|issuer_node| {
      let cik = get_string(&issuer_node, "issuerCik")?;
      let name = get_string(&issuer_node, "issuerName").ok();
      let trading_symbol = get_string(&issuer_node, "issuerTradingSymbol")?;

      Ok(Issuer {
        cik,
        name,
        trading_symbol,
      })
    })
}

fn parse_reporting_owner(node: &roxmltree::Node) -> Result<ReportingOwner, String> {
  node
    .children()
    .find(|node| node.has_tag_name("reportingOwner"))
    .ok_or("reportingOwner not found".to_string())
    .and_then(|owner_node| {
      let id = parse_reporting_owner_id(&owner_node)?;
      let address = parse_reporting_owner_address(&owner_node)?;
      let relationship = parse_reporting_owner_relationship(&owner_node)?;

      Ok(ReportingOwner {
        id,
        address,
        relationship,
      })
    })
}

fn parse_reporting_owner_id(node: &roxmltree::Node) -> Result<ReportingOwnerID, String> {
  node
    .children()
    .find(|node| node.has_tag_name("reportingOwnerId"))
    .ok_or("reportingOwnerId not found".to_string())
    .and_then(|id_node| {
      let cik = get_string(&id_node, "rptOwnerCik")?;
      let ccc = get_string(&id_node, "rptOwnerCcc").ok();
      let name = get_string(&id_node, "rptOwnerName").ok();

      Ok(ReportingOwnerID { cik, ccc, name })
    })
}

fn parse_reporting_owner_address(
  node: &roxmltree::Node,
) -> Result<Option<ReportingOwnerAddress>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("reportingOwnerAddress"))
    .map(|address_node| {
      let street1 = get_string(&address_node, "rptOwnerStreet1").ok();
      let street2 = get_string(&address_node, "rptOwnerStreet2").ok();
      let city = get_string(&address_node, "rptOwnerCity").ok();
      let state = get_string(&address_node, "rptOwnerState").ok();
      let zip_code = get_string(&address_node, "rptOwnerZipCode").ok();
      let state_description = get_string(&address_node, "rptOwnerStateDescription").ok();

      Ok(ReportingOwnerAddress {
        street1,
        street2,
        city,
        state,
        zip_code,
        state_description,
      })
    })
    .transpose()
}

fn parse_reporting_owner_relationship(
  node: &roxmltree::Node,
) -> Result<Option<ReportingOwnerRelationship>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("reportingOwnerRelationship"))
    .map(|relationship_node| {
      let is_director = get_bool(&relationship_node, "isDirector").ok();
      let is_officer = get_bool(&relationship_node, "isOfficer").ok();
      let is_ten_percent_owner = get_bool(&relationship_node, "isTenPercentOwner").ok();
      let is_other = get_bool(&relationship_node, "isOther").ok();
      let officer_title = get_string(&relationship_node, "officerTitle").ok();
      let other_text = get_string(&relationship_node, "otherText").ok();

      Ok(ReportingOwnerRelationship {
        is_director,
        is_officer,
        is_ten_percent_owner,
        is_other,
        officer_title,
        other_text,
      })
    })
    .transpose()
}

fn parse_non_derivative_table(env: Env, node: &Node) -> Result<Option<NonDerivativeTable>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("nonDerivativeTable"))
    .map(|table_node| {
      let transactions = parse_non_derivative_transactions(env, &table_node)?;
      let holdings = parse_non_derivative_holdings(env, &table_node)?;

      Ok(NonDerivativeTable {
        transactions,
        holdings,
      })
    })
    .transpose()
}

fn parse_derivative_table(env: Env, node: &Node) -> Result<Option<DerivativeTable>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("derivativeTable"))
    .map(|table_node| {
      let transactions = parse_derivative_transactions(env, &table_node)?;
      let holdings = parse_derivative_holdings(env, &table_node)?;

      Ok(DerivativeTable {
        transactions,
        holdings,
      })
    })
    .transpose()
}

fn parse_non_derivative_transactions(
  env: Env,
  node: &Node,
) -> Result<Vec<NonDerivativeTransaction>, String> {
  let transactions = node
    .children()
    .filter(|node| node.has_tag_name("nonDerivativeTransaction"))
    .filter_map(|transaction_node| {
      let security_title = get_value_footnote(env, &transaction_node, "securityTitle");
      let transaction_date = get_value_footnote(env, &transaction_node, "transactionDate");
      let deemed_execution_date = get_value_footnote(env, &transaction_node, "deemedExecutionDate");
      let transaction_timeliness = get_value_footnote(env, &transaction_node, "transactionCoding");
      let transaction_coding = parse_transaction_coding(&transaction_node).ok()?;
      let transaction_amounts = parse_transaction_amounts(env, &transaction_node).ok()?;
      let post_transaction_amounts = parse_post_transaction_amounts(env, &transaction_node).ok()?;
      let ownership_nature = parse_ownership_nature(env, &transaction_node).ok()?;

      Some(NonDerivativeTransaction {
        security_title,
        transaction_date,
        deemed_execution_date,
        transaction_timeliness,
        transaction_coding,
        transaction_amounts,
        post_transaction_amounts,
        ownership_nature,
      })
    })
    .collect();
  Ok(transactions)
}

fn parse_derivative_transactions(
  env: Env,
  node: &Node,
) -> Result<Vec<DerivativeTransaction>, String> {
  let transactions = node
    .children()
    .filter(|node| node.has_tag_name("derivativeTransaction"))
    .filter_map(|transaction_node| {
      let security_title = get_value_footnote(env, &transaction_node, "securityTitle");
      let conversion_or_exercise_price =
        get_value_footnote(env, &transaction_node, "conversionOrExercisePrice");
      let deemed_execution_date = get_value_footnote(env, &transaction_node, "deemedExecutionDate");
      let transaction_coding = parse_transaction_coding(&transaction_node).ok()?;
      let transaction_timeliness =
        get_value_footnote(env, &transaction_node, "transactionTimeliness");
      let transaction_amounts =
        parse_derivative_transaction_amounts(env, &transaction_node).ok()?;
      let exercise_date = get_value_footnote(env, &transaction_node, "exerciseDate");
      let expiration_date = get_value_footnote(env, &transaction_node, "expirationDate");
      let underlying_security = parse_underlying_security(env, &transaction_node).ok()?;
      let post_transaction_amounts = parse_post_transaction_amounts(env, &transaction_node).ok()?;
      let ownership_nature = parse_ownership_nature(env, &transaction_node).ok()?;

      Some(DerivativeTransaction {
        security_title,
        conversion_or_exercise_price,
        deemed_execution_date,
        transaction_coding,
        transaction_timeliness,
        transaction_amounts,
        exercise_date,
        expiration_date,
        underlying_security,
        post_transaction_amounts,
        ownership_nature,
      })
    })
    .collect();
  Ok(transactions)
}

fn parse_non_derivative_holdings(
  env: Env,
  node: &Node,
) -> Result<Vec<NonDerivativeHolding>, String> {
  let holdings = node
    .children()
    .filter(|node| node.has_tag_name("nonDerivativeHolding"))
    .filter_map(|holdings_node| {
      let security_title = get_value_footnote(env, &holdings_node, "securityTitle");
      let transaction_coding = parse_holding_coding(&holdings_node).ok()?;
      let post_transaction_amounts = parse_post_transaction_amounts(env, &holdings_node).ok()?;
      let ownership_nature = parse_ownership_nature(env, &holdings_node).ok()?;

      Some(NonDerivativeHolding {
        security_title,
        transaction_coding,
        post_transaction_amounts,
        ownership_nature,
      })
    })
    .collect();
  Ok(holdings)
}

fn parse_derivative_holdings(env: Env, node: &Node) -> Result<Vec<DerivativeHolding>, String> {
  let holdings = node
    .children()
    .filter(|node| node.has_tag_name("derivativeHolding"))
    .filter_map(|holdings_node| {
      let security_title = get_value_footnote(env, &holdings_node, "securityTitle");
      let conversion_or_exercise_price =
        get_value_footnote(env, &holdings_node, "conversionOrExercisePrice");
      let transaction_coding = parse_holding_coding(&holdings_node).ok()?;
      let exercise_date = get_value_footnote(env, &holdings_node, "exerciseDate");
      let expiration_date = get_value_footnote(env, &holdings_node, "expirationDate");
      let underlying_security = parse_underlying_security(env, &holdings_node).ok()?;
      let post_transaction_amounts = parse_post_transaction_amounts(env, &holdings_node).ok()?;
      let ownership_nature = parse_ownership_nature(env, &holdings_node).ok()?;

      Some(DerivativeHolding {
        security_title,
        conversion_or_exercise_price,
        transaction_coding,
        exercise_date,
        expiration_date,
        underlying_security,
        post_transaction_amounts,
        ownership_nature,
      })
    })
    .collect();
  Ok(holdings)
}

fn parse_transaction_coding(node: &roxmltree::Node) -> Result<Option<TransactionCoding>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("transactionCoding"))
    .map(|coding_node| {
      let form_type = get_string(&coding_node, "transactionFormType").ok();
      let transaction_code = get_string(&coding_node, "transactionCode").ok();
      let equity_swap_involved = get_bool(&coding_node, "equitySwapInvolved").ok();
      let footnote_id = get_string(&coding_node, "footnoteId").ok();

      Ok(TransactionCoding {
        form_type,
        transaction_code,
        equity_swap_involved,
        footnote_id,
      })
    })
    .transpose()
}

fn parse_holding_coding(node: &roxmltree::Node) -> Result<Option<HoldingCoding>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("transactionCoding"))
    .map(|coding_node| {
      let form_type = get_string(&coding_node, "transactionFormType").ok();
      let footnote_id = get_string(&coding_node, "footnoteId").ok();

      Ok(HoldingCoding {
        form_type,
        footnote_id,
      })
    })
    .transpose()
}

fn parse_transaction_amounts(env: Env, node: &Node) -> Result<Option<TransactionAmounts>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("transactionAmounts"))
    .map(|amounts_node| {
      let shares = get_value_footnote(env, &amounts_node, "transactionShares");
      let price_per_share = get_value_footnote(env, &amounts_node, "transactionPricePerShare");
      let acquired_disposed_code =
        get_value_footnote(env, &amounts_node, "transactionAcquiredDisposedCode");

      Ok(TransactionAmounts {
        shares,
        price_per_share,
        acquired_disposed_code,
      })
    })
    .transpose()
}

fn parse_derivative_transaction_amounts(
  env: Env,
  node: &Node,
) -> Result<Option<DerivativeTransactionAmounts>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("transactionAmounts"))
    .map(|amounts_node| {
      let shares = get_value_footnote(env, &amounts_node, "transactionShares");
      let price_per_share = get_value_footnote(env, &amounts_node, "transactionPricePerShare");
      let total_value = get_value_footnote(env, &amounts_node, "transactionTotalValue");
      let acquired_disposed_code =
        get_value_footnote(env, &amounts_node, "transactionAcquiredDisposedCode");

      Ok(DerivativeTransactionAmounts {
        shares,
        price_per_share,
        total_value,
        acquired_disposed_code,
      })
    })
    .transpose()
}

fn parse_underlying_security(env: Env, node: &Node) -> Result<Option<UnderlyingSecurity>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("underlyingSecurity"))
    .map(|security_node| {
      let title = get_value_footnote(env, &security_node, "underlyingSecurityTitle");
      let shares = get_value_footnote(env, &security_node, "underlyingSecurityShares");
      let value = get_value_footnote(env, &security_node, "underlyingSecurityValue");

      Ok(UnderlyingSecurity {
        title,
        shares,
        value,
      })
    })
    .transpose()
}

fn parse_post_transaction_amounts(
  env: Env,
  node: &Node,
) -> Result<Option<PostTransactionAmounts>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("postTransactionAmounts"))
    .map(|amounts_node| {
      let shares_owned_following_transaction =
        get_value_footnote(env, &amounts_node, "sharesOwnedFollowingTransaction");
      let value_owned_following_transaction =
        get_value_footnote(env, &amounts_node, "valueOwnedFollowingTransaction");

      Ok(PostTransactionAmounts {
        shares_owned_following_transaction,
        value_owned_following_transaction,
      })
    })
    .transpose()
}

fn parse_ownership_nature(env: Env, node: &Node) -> Result<Option<OwnershipNature>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("ownershipNature"))
    .map(|nature_node| {
      let direct_or_indirect_ownership =
        get_value_footnote(env, &nature_node, "directOrIndirectOwnership");
      let nature_of_ownership = get_value_footnote(env, &nature_node, "natureOfOwnership");

      Ok(OwnershipNature {
        direct_or_indirect_ownership,
        nature_of_ownership,
      })
    })
    .transpose()
}

fn parse_footnotes(node: &Node) -> Result<Vec<Footnote>, String> {
  let footnotes = node
    .children()
    .filter(|node| node.has_tag_name("footnotes"))
    .flat_map(|node| node.children())
    .filter(|node| node.has_tag_name("footnote"))
    .filter_map(|footnote_node| {
      let id = footnote_node.attribute("id").map(|id| id.to_string());
      let note = footnote_node.text().map(|text| text.to_string());

      Some(Footnote { id, note })
    })
    .collect();
  Ok(footnotes)
}

fn parse_owner_signature(node: &roxmltree::Node) -> Result<OwnerSignature, String> {
  node
    .children()
    .find(|node| node.has_tag_name("ownerSignature"))
    .ok_or("ownerSignature not found".to_string())
    .and_then(|signature_node| {
      let name = get_string(&signature_node, "signatureName")?;
      let date = get_string(&signature_node, "signatureDate")?;

      Ok(OwnerSignature { name, date })
    })
}

fn get_value_footnote(env: Env, node: &Node, tag: &str) -> Option<ValueFootnote> {
  node
    .children()
    .find(|node| node.has_tag_name(tag))
    .map(|tag_node| {
      let value = tag_node
        .children()
        .find(|child_node| child_node.has_tag_name("value"))
        .and_then(|value_node| value_node.text())
        .map(|s| parse_value(env, s))
        .transpose()
        .unwrap_or(None);

      let footnote_id = tag_node
        .children()
        .find(|child_node| child_node.has_tag_name("footnoteId"))
        .and_then(|id_node| id_node.attribute("id"))
        .map(|s| s.to_string());

      ValueFootnote { value, footnote_id }
    })
}
