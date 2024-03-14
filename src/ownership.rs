use napi::Env;
use napi::Error;
use napi::JsUnknown;
use napi_derive::napi;
use roxmltree::{Document as XMLDoc, Node};

use crate::{parse_string, parse_value};

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
  pub reporting_owners: Vec<ReportingOwner>,
  pub aff10b5_one: Option<bool>,
  pub non_derivative_table: Option<NonDerivativeTable>,
  pub derivative_table: Option<DerivativeTable>,
  pub footnotes: Vec<Footnote>,
  pub remarks: Option<String>,
  pub owner_signatures: Vec<OwnerSignature>,
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

#[napi(object, js_name = "ReportingOwnerID")]
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
  pub security_title: Option<ValueFootnotes>,
  pub transaction_date: Option<ValueFootnotes>,
  pub deemed_execution_date: Option<ValueFootnotes>,
  pub transaction_coding: Option<TransactionCoding>,
  pub transaction_timeliness: Option<ValueFootnotes>,
  pub transaction_amounts: Option<TransactionAmounts>,
  pub post_transaction_amounts: Option<PostTransactionAmounts>,
  pub ownership_nature: Option<OwnershipNature>,
}

#[napi(object)]
pub struct DerivativeTransaction {
  pub security_title: Option<ValueFootnotes>,
  pub conversion_or_exercise_price: Option<ValueFootnotes>,
  pub deemed_execution_date: Option<ValueFootnotes>,
  pub transaction_date: Option<ValueFootnotes>,
  pub transaction_coding: Option<TransactionCoding>,
  pub transaction_timeliness: Option<ValueFootnotes>,
  pub transaction_amounts: Option<DerivativeTransactionAmounts>,
  pub exercise_date: Option<ValueFootnotes>,
  pub expiration_date: Option<ValueFootnotes>,
  pub underlying_security: Option<UnderlyingSecurity>,
  pub post_transaction_amounts: Option<PostTransactionAmounts>,
  pub ownership_nature: Option<OwnershipNature>,
}

#[napi(object)]
pub struct NonDerivativeHolding {
  pub security_title: Option<ValueFootnotes>,
  pub transaction_coding: Option<HoldingCoding>,
  pub post_transaction_amounts: Option<PostTransactionAmounts>,
  pub ownership_nature: Option<OwnershipNature>,
}

#[napi(object)]
pub struct DerivativeHolding {
  pub security_title: Option<ValueFootnotes>,
  pub conversion_or_exercise_price: Option<ValueFootnotes>,
  pub transaction_coding: Option<HoldingCoding>,
  pub exercise_date: Option<ValueFootnotes>,
  pub expiration_date: Option<ValueFootnotes>,
  pub underlying_security: Option<UnderlyingSecurity>,
  pub post_transaction_amounts: Option<PostTransactionAmounts>,
  pub ownership_nature: Option<OwnershipNature>,
}

#[napi(object)]
pub struct TransactionCoding {
  pub form_type: Option<String>,
  pub transaction_code: Option<String>,
  pub equity_swap_involved: Option<bool>,
  pub footnote_ids: Option<Vec<String>>,
}

#[napi(object)]
pub struct HoldingCoding {
  pub form_type: Option<String>,
  pub footnote_ids: Option<Vec<String>>,
}

#[napi(object)]
pub struct TransactionAmounts {
  pub shares: Option<ValueFootnotes>,
  pub price_per_share: Option<ValueFootnotes>,
  pub acquired_disposed_code: Option<ValueFootnotes>,
}

#[napi(object)]
pub struct DerivativeTransactionAmounts {
  pub shares: Option<ValueFootnotes>,
  pub price_per_share: Option<ValueFootnotes>,
  pub total_value: Option<ValueFootnotes>,
  pub acquired_disposed_code: Option<ValueFootnotes>,
}

#[napi(object)]
pub struct UnderlyingSecurity {
  pub title: Option<ValueFootnotes>,
  pub shares: Option<ValueFootnotes>,
  pub value: Option<ValueFootnotes>,
}

#[napi(object)]
pub struct PostTransactionAmounts {
  pub shares_owned_following_transaction: Option<ValueFootnotes>,
  pub value_owned_following_transaction: Option<ValueFootnotes>,
}

#[napi(object)]
pub struct OwnershipNature {
  pub direct_or_indirect_ownership: Option<ValueFootnotes>,
  pub nature_of_ownership: Option<ValueFootnotes>,
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
pub struct ValueFootnotes {
  pub value: Option<JsUnknown>,
  pub footnote_ids: Option<Vec<String>>,
}

#[napi]
pub fn parse_ownership_form(env: Env, form: String) -> Result<OwnershipForm, Error> {
  let doc = XMLDoc::parse(&form).map_err(|e| Error::from_reason(e.to_string()))?;
  let root_node = doc.root_element();
  let schema_version = parse_string::<String>(&root_node, "schemaVersion");
  let document_type = parse_string::<String>(&root_node, "documentType")
    .ok_or("documentType not found".to_string())
    .map_err(Error::from_reason)?;
  let period_of_report = parse_string::<String>(&root_node, "periodOfReport")
    .ok_or("periodOfReport not found".to_string())
    .map_err(Error::from_reason)?;
  let date_of_original_submission = parse_string::<String>(&root_node, "dateOfOriginalSubmission");
  let no_securities_owned = parse_string::<bool>(&root_node, "noSecuritiesOwned");
  let not_subject_to_section_16 = parse_string::<bool>(&root_node, "notSubjectToSection16");
  let form3_holdings_reported = parse_string::<bool>(&root_node, "form3HoldingsReported");
  let form4_transactions_reported = parse_string::<bool>(&root_node, "form4TransactionsReported");
  let aff10b5_one = parse_string::<bool>(&root_node, "aff10b5One");
  let issuer = parse_issuer(&root_node).map_err(Error::from_reason)?;
  let reporting_owners = parse_reporting_owners(&root_node).map_err(Error::from_reason)?;
  let non_derivative_table =
    parse_non_derivative_table(env, &root_node).map_err(Error::from_reason)?;
  let derivative_table = parse_derivative_table(env, &root_node).map_err(Error::from_reason)?;
  let footnotes = parse_footnotes(&root_node).map_err(Error::from_reason)?;
  let remarks = parse_string::<String>(&root_node, "remarks");
  let owner_signatures = parse_owner_signatures(&root_node).map_err(Error::from_reason)?;

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
    reporting_owners,
    aff10b5_one,
    non_derivative_table,
    derivative_table,
    footnotes,
    remarks,
    owner_signatures,
  })
}

fn parse_issuer(node: &Node) -> Result<Issuer, String> {
  node
    .children()
    .find(|node| node.has_tag_name("issuer"))
    .ok_or("issuer not found".to_string())
    .and_then(|issuer_node| {
      let cik = parse_string::<String>(&issuer_node, "issuerCik")
        .ok_or("issuerCik not found".to_string())?;
      let name = parse_string::<String>(&issuer_node, "issuerName");
      let trading_symbol = parse_string::<String>(&issuer_node, "issuerTradingSymbol")
        .ok_or("issuerTradingSymbol not found".to_string())?;

      Ok(Issuer {
        cik,
        name,
        trading_symbol,
      })
    })
}

fn parse_reporting_owners(node: &Node) -> Result<Vec<ReportingOwner>, String> {
  let owners = node
    .children()
    .filter(|node| node.has_tag_name("reportingOwner"))
    .map(|owner_node| {
      let id = parse_reporting_owner_id(&owner_node)?;
      let address = parse_reporting_owner_address(&owner_node)?;
      let relationship = parse_reporting_owner_relationship(&owner_node)?;

      Ok(ReportingOwner {
        id,
        address,
        relationship,
      })
    })
    .collect::<Result<Vec<ReportingOwner>, String>>();

  if owners.as_ref().map_or(true, |v| v.is_empty()) {
    Err("reportingOwner not found".to_string())
  } else {
    owners
  }
}

fn parse_reporting_owner_id(node: &Node) -> Result<ReportingOwnerID, String> {
  node
    .children()
    .find(|node| node.has_tag_name("reportingOwnerId"))
    .ok_or("reportingOwnerId not found".to_string())
    .and_then(|id_node| {
      let cik = parse_string::<String>(&id_node, "rptOwnerCik")
        .ok_or("rptOwnerCik not found".to_string())?;
      let ccc = parse_string::<String>(&id_node, "rptOwnerCcc");
      let name = parse_string::<String>(&id_node, "rptOwnerName");

      Ok(ReportingOwnerID { cik, ccc, name })
    })
}

fn parse_reporting_owner_address(node: &Node) -> Result<Option<ReportingOwnerAddress>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("reportingOwnerAddress"))
    .map(|address_node| {
      let street1 = parse_string::<String>(&address_node, "rptOwnerStreet1");
      let street2 = parse_string::<String>(&address_node, "rptOwnerStreet2");
      let city = parse_string::<String>(&address_node, "rptOwnerCity");
      let state = parse_string::<String>(&address_node, "rptOwnerState");
      let zip_code = parse_string::<String>(&address_node, "rptOwnerZipCode");
      let state_description = parse_string::<String>(&address_node, "rptOwnerStateDescription");

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
  node: &Node,
) -> Result<Option<ReportingOwnerRelationship>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("reportingOwnerRelationship"))
    .map(|relationship_node| {
      let is_director = parse_string::<bool>(&relationship_node, "isDirector");
      let is_officer = parse_string::<bool>(&relationship_node, "isOfficer");
      let is_ten_percent_owner = parse_string::<bool>(&relationship_node, "isTenPercentOwner");
      let is_other = parse_string::<bool>(&relationship_node, "isOther");
      let officer_title = parse_string::<String>(&relationship_node, "officerTitle");
      let other_text = parse_string::<String>(&relationship_node, "otherText");

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
      let security_title = get_value_footnotes(env, &transaction_node, "securityTitle");
      let transaction_date = get_value_footnotes(env, &transaction_node, "transactionDate");
      let deemed_execution_date =
        get_value_footnotes(env, &transaction_node, "deemedExecutionDate");
      let transaction_timeliness =
        get_value_footnotes(env, &transaction_node, "transactionTimeliness");
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
      let security_title = get_value_footnotes(env, &transaction_node, "securityTitle");
      let conversion_or_exercise_price =
        get_value_footnotes(env, &transaction_node, "conversionOrExercisePrice");
      let transaction_date = get_value_footnotes(env, &transaction_node, "transactionDate");
      let deemed_execution_date =
        get_value_footnotes(env, &transaction_node, "deemedExecutionDate");
      let transaction_coding = parse_transaction_coding(&transaction_node).ok()?;
      let transaction_timeliness =
        get_value_footnotes(env, &transaction_node, "transactionTimeliness");
      let transaction_amounts =
        parse_derivative_transaction_amounts(env, &transaction_node).ok()?;
      let exercise_date = get_value_footnotes(env, &transaction_node, "exerciseDate");
      let expiration_date = get_value_footnotes(env, &transaction_node, "expirationDate");
      let underlying_security = parse_underlying_security(env, &transaction_node).ok()?;
      let post_transaction_amounts = parse_post_transaction_amounts(env, &transaction_node).ok()?;
      let ownership_nature = parse_ownership_nature(env, &transaction_node).ok()?;

      Some(DerivativeTransaction {
        security_title,
        conversion_or_exercise_price,
        deemed_execution_date,
        transaction_date,
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
      let security_title = get_value_footnotes(env, &holdings_node, "securityTitle");
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
      let security_title = get_value_footnotes(env, &holdings_node, "securityTitle");
      let conversion_or_exercise_price =
        get_value_footnotes(env, &holdings_node, "conversionOrExercisePrice");
      let transaction_coding = parse_holding_coding(&holdings_node).ok()?;
      let exercise_date = get_value_footnotes(env, &holdings_node, "exerciseDate");
      let expiration_date = get_value_footnotes(env, &holdings_node, "expirationDate");
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

fn parse_transaction_coding(node: &Node) -> Result<Option<TransactionCoding>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("transactionCoding"))
    .map(|coding_node| {
      let form_type = parse_string::<String>(&coding_node, "transactionFormType");
      let transaction_code = parse_string::<String>(&coding_node, "transactionCode");
      let equity_swap_involved = parse_string::<bool>(&coding_node, "equitySwapInvolved");
      let footnote_ids = parse_footnote_ids(&coding_node);

      Ok(TransactionCoding {
        form_type,
        transaction_code,
        equity_swap_involved,
        footnote_ids,
      })
    })
    .transpose()
}

fn parse_holding_coding(node: &Node) -> Result<Option<HoldingCoding>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("transactionCoding"))
    .map(|coding_node| {
      let form_type = parse_string::<String>(&coding_node, "transactionFormType");
      let footnote_ids = parse_footnote_ids(&coding_node);

      Ok(HoldingCoding {
        form_type,
        footnote_ids,
      })
    })
    .transpose()
}

fn parse_transaction_amounts(env: Env, node: &Node) -> Result<Option<TransactionAmounts>, String> {
  node
    .children()
    .find(|node| node.has_tag_name("transactionAmounts"))
    .map(|amounts_node| {
      let shares = get_value_footnotes(env, &amounts_node, "transactionShares");
      let price_per_share = get_value_footnotes(env, &amounts_node, "transactionPricePerShare");
      let acquired_disposed_code =
        get_value_footnotes(env, &amounts_node, "transactionAcquiredDisposedCode");

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
      let shares = get_value_footnotes(env, &amounts_node, "transactionShares");
      let price_per_share = get_value_footnotes(env, &amounts_node, "transactionPricePerShare");
      let total_value = get_value_footnotes(env, &amounts_node, "transactionTotalValue");
      let acquired_disposed_code =
        get_value_footnotes(env, &amounts_node, "transactionAcquiredDisposedCode");

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
      let title = get_value_footnotes(env, &security_node, "underlyingSecurityTitle");
      let shares = get_value_footnotes(env, &security_node, "underlyingSecurityShares");
      let value = get_value_footnotes(env, &security_node, "underlyingSecurityValue");

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
        get_value_footnotes(env, &amounts_node, "sharesOwnedFollowingTransaction");
      let value_owned_following_transaction =
        get_value_footnotes(env, &amounts_node, "valueOwnedFollowingTransaction");

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
        get_value_footnotes(env, &nature_node, "directOrIndirectOwnership");
      let nature_of_ownership = get_value_footnotes(env, &nature_node, "natureOfOwnership");

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

fn parse_owner_signatures(node: &Node) -> Result<Vec<OwnerSignature>, String> {
  node
    .children()
    .filter(|node| node.has_tag_name("ownerSignature"))
    .map(|signature_node| {
      let name = parse_string::<String>(&signature_node, "signatureName")
        .ok_or_else(|| "signatureName not found".to_string())?;
      let date = parse_string::<String>(&signature_node, "signatureDate")
        .ok_or_else(|| "signatureDate not found".to_string())?;
      Ok(OwnerSignature { name, date })
    })
    .collect()
}

fn parse_footnote_ids(node: &Node) -> Option<Vec<String>> {
  let footnote_ids: Vec<String> = node
    .children()
    .filter(|child_node| child_node.has_tag_name("footnoteId"))
    .filter_map(|id_node| id_node.attribute("id"))
    .map(ToString::to_string)
    .collect();

  Some(footnote_ids)
}

fn get_value_footnotes(env: Env, node: &Node, tag: &str) -> Option<ValueFootnotes> {
  node
    .children()
    .find(|node| node.has_tag_name(tag))
    .map(|tag_node| {
      let value = tag_node
        .children()
        .find(|child_node| child_node.has_tag_name("value"))
        .map(|value_node| {
          let text = value_node.text().unwrap_or_else(|| "");
          parse_value(env, &text)
        })
        .transpose()
        .unwrap_or(None);

      let footnote_ids = parse_footnote_ids(&tag_node);

      ValueFootnotes {
        value,
        footnote_ids,
      }
    })
}
