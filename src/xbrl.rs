use napi::{Env, Error, JsUnknown};
use napi_derive::napi;
use roxmltree::{Document as XMLDoc, Node};
use std::{collections::HashMap, rc::Rc};

use crate::{parse_date, parse_value};

#[napi(object)]
pub struct XBRL {
  pub facts: Vec<Fact>,
}

#[napi(object)]
pub struct Fact {
  pub context: Rc<Context>,
  pub concept: String,
  pub value: JsUnknown,
  pub decimals: Option<String>,
  pub unit: Option<String>,
}

#[napi(object)]
#[derive(Clone)]
pub struct Context {
  pub entity: String,
  pub segments: Vec<Segment>,
  pub period: Period,
}

#[napi(object)]
#[derive(Clone)]
pub struct Segment {
  pub dimension: String,
  pub member: String,
}

#[napi(object)]
#[derive(Clone)]
pub struct Period {
  pub instant: Option<String>,
  pub start_date: Option<String>,
  pub end_date: Option<String>,
}

#[napi]
pub fn parse_xbrl(env: Env, xbrl: String) -> Result<XBRL, Error> {
  let doc = XMLDoc::parse(&xbrl).map_err(|e| Error::from_reason(e.to_string()))?;
  let root = doc.root_element();

  let xbrldi_ns = root
    .namespaces()
    .find(|ns| ns.name() == Some("xbrldi"))
    .map(|ns| ns.uri())
    .unwrap_or_default();

  let units = parse_units(&root);
  let contexts = parse_contexts(&root, &xbrldi_ns);

  let facts: Result<Vec<_>, Error> = root
    .children()
    .filter_map(|node| {
      node.attribute("contextRef").and_then(|context_ref| {
        contexts.get(context_ref).map(|context| {
          let concept = node.tag_name().name().to_owned();
          let value_str = node.text().unwrap_or_default().to_owned();
          let value = parse_value(env, &value_str)?;
          let decimals = node.attribute("decimals").map(|s| s.to_owned());
          let unit = if let Some(unit_ref) = node.attribute("unitRef") {
            units.get(unit_ref).cloned()
          } else {
            None
          };
          Ok(Fact {
            context: Rc::new(context.clone()),
            concept,
            value,
            decimals,
            unit,
          })
        })
      })
    })
    .collect();

  let facts = facts?;

  Ok(XBRL { facts })
}

fn parse_units(root: &Node) -> HashMap<String, String> {
  let mut units = HashMap::new();

  for unit_node in root.children().filter(|node| node.has_tag_name("unit")) {
    let unit_id = unit_node.attribute("id").unwrap_or_default().to_owned();

    let measure = if let Some(divide_node) = unit_node
      .children()
      .find(|node| node.has_tag_name("divide"))
    {
      let numerator_measure = get_text_or_default(
        divide_node
          .children()
          .find(|node| node.has_tag_name("unitNumerator"))
          .and_then(|node| node.children().find(|n| n.has_tag_name("measure"))),
      );
      let denominator_measure = get_text_or_default(
        divide_node
          .children()
          .find(|node| node.has_tag_name("unitDenominator"))
          .and_then(|node| node.children().find(|n| n.has_tag_name("measure"))),
      );
      format!("{}/{}", numerator_measure, denominator_measure)
    } else {
      get_text_or_default(
        unit_node
          .children()
          .find(|node| node.has_tag_name("measure")),
      )
    };

    units.insert(unit_id, measure);
  }

  units
}

fn parse_contexts(root: &Node, xbrldi_ns: &str) -> HashMap<String, Context> {
  let mut contexts = HashMap::new();

  for context_node in root.children().filter(|node| node.has_tag_name("context")) {
    let context_id = context_node.attribute("id").unwrap().to_owned();

    if let Some(entity_node) = context_node
      .children()
      .find(|node| node.has_tag_name("entity"))
    {
      let entity = entity_node
        .children()
        .find(|node| node.has_tag_name("identifier"))
        .and_then(|node| node.text().map(str::to_owned))
        .unwrap_or_default();

      let mut segments = vec![];
      for segment_node in entity_node
        .children()
        .filter(|node| node.has_tag_name("segment"))
      {
        for member_node in segment_node
          .children()
          .filter(|node| node.has_tag_name((xbrldi_ns, "explicitMember")))
        {
          let raw_dimension = member_node.attribute("dimension").unwrap().to_owned();
          let dimension = raw_dimension.split(':').nth(1).unwrap_or("");
          let raw_member = member_node.text().unwrap_or_default().to_owned();
          let member = raw_member.split(':').nth(1).unwrap_or("");

          segments.push(Segment {
            dimension: dimension.to_owned(),
            member: member.to_owned(),
          });
        }
      }

      if let Some(period_node) = context_node
        .children()
        .find(|node| node.has_tag_name("period"))
      {
        let period = Period {
          instant: parse_date(&period_node, "instant"),
          start_date: parse_date(&period_node, "startDate"),
          end_date: parse_date(&period_node, "endDate"),
        };

        contexts.insert(
          context_id,
          Context {
            entity,
            segments,
            period,
          },
        );
      }
    }
  }

  contexts
}

fn get_text_or_default(node: Option<Node>) -> String {
  node.and_then(|n| n.text()).unwrap_or_default().to_owned()
}
