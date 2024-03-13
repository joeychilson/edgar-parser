use napi::{Env, JsUnknown};
use roxmltree::Node;

pub mod ownership;
pub mod thirteenf;
pub mod xbrl;

fn get_string(node: &Node, tag: &str) -> Result<String, String> {
  node
    .children()
    .find(|node| node.has_tag_name(tag))
    .and_then(|node| node.text())
    .map(|s| s.to_string())
    .ok_or(format!("missing tag: {}", tag))
}

fn get_int32(node: &Node, tag: &str) -> Result<i32, String> {
  let text = get_string(node, tag)?;
  text
    .parse::<i32>()
    .map_err(|_| format!("failed to parse int32 from tag: {}", tag))
}

fn get_int64(node: &Node, tag: &str) -> Result<i64, String> {
  let text = get_string(node, tag)?;
  text
    .parse::<i64>()
    .map_err(|_| format!("failed to parse int64 from tag: {}", tag))
}

fn get_bool(node: &Node, tag: &str) -> Result<bool, String> {
  let text = get_string(node, tag)?;
  match text.to_uppercase().as_str() {
    "1" | "Y" | "TRUE" => Ok(true),
    "0" | "N" | "FALSE" => Ok(false),
    _ => Err(format!("failed to parse bool from tag: {}", tag)),
  }
}

fn get_ints(node: &Node, tag: &str) -> Vec<i32> {
  node
    .children()
    .filter(|node| node.has_tag_name(tag))
    .filter_map(|node| node.text())
    .flat_map(|text| text.split(',').filter_map(|s| s.trim().parse::<i32>().ok()))
    .collect()
}

fn get_date(node: &Node, tag: &str) -> Option<String> {
  node
    .children()
    .find(|n| n.has_tag_name(tag))
    .and_then(|n| n.text().map(str::to_owned))
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
