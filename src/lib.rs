use napi::{Env, JsUnknown};
use roxmltree::Node;

pub mod form_13f;
pub mod ownership;
pub mod xbrl;

fn parse_date(node: &Node, tag: &str) -> Option<String> {
  node
    .children()
    .find(|n| n.has_tag_name(tag))
    .and_then(|n| n.text())
    .map(ToString::to_string)
}

fn parse_ints(node: &Node, tag: &str) -> Vec<i32> {
  node
    .children()
    .filter(|node| node.has_tag_name(tag))
    .filter_map(|node| node.text())
    .flat_map(|text| text.split(','))
    .filter_map(|s| s.trim().parse().ok())
    .collect()
}
trait ParseFromString {
  type Output;
  fn parse(s: &str) -> Result<Self::Output, String>;
}

impl ParseFromString for String {
  type Output = String;

  fn parse(s: &str) -> Result<Self::Output, String> {
    Ok(s.to_owned())
  }
}

impl ParseFromString for i32 {
  type Output = i32;

  fn parse(s: &str) -> Result<Self::Output, String> {
    s.parse::<i32>()
      .map_err(|_| format!("failed to parse i32 from: {}", s))
  }
}

impl ParseFromString for i64 {
  type Output = i64;

  fn parse(s: &str) -> Result<Self::Output, String> {
    s.parse::<i64>()
      .map_err(|_| format!("failed to parse i64 from: {}", s))
  }
}

impl ParseFromString for bool {
  type Output = bool;

  fn parse(s: &str) -> Result<Self::Output, String> {
    match s.to_uppercase().as_str() {
      "1" | "Y" | "TRUE" => Ok(true),
      "0" | "N" | "FALSE" => Ok(false),
      _ => Err(format!("failed to parse bool from: {}", s)),
    }
  }
}

fn parse_string<T: ParseFromString>(node: &Node, tag: &str) -> Option<T::Output> {
  node
    .children()
    .find(|node| node.has_tag_name(tag))
    .and_then(|node| node.text())
    .and_then(|text| T::parse(text).ok())
}

fn parse_value(env: Env, value_str: &str) -> napi::Result<JsUnknown> {
  let str = value_str.trim();
  if let Ok(value) = str.parse::<bool>() {
    env.get_boolean(value).map(|v| v.into_unknown())
  } else if let Ok(value) = str.parse::<i64>() {
    env.create_int64(value).map(|v| v.into_unknown())
  } else if let Ok(value) = str.parse::<f64>() {
    env.create_double(value).map(|v| v.into_unknown())
  } else {
    env.create_string(str).map(|v| v.into_unknown())
  }
}
