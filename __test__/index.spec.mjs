import test from "ava";
import fs from "fs";
import { parseForm13F, parseForm13FTable, parseXbrl } from "../index.js";

test("parse xbrl from native", async (t) => {
  const startTime = Date.now();

  const file = fs.readFileSync("./__test__/xbrl.xml", "utf8");
  const result = parseXbrl(file);

  const endTime = Date.now();
  console.log("Parsed XBRL:", endTime - startTime, "ms");

  t.is(result.facts.length, 1578);

  const firstFact = result.facts[0];
  t.is(firstFact.concept, "CurrentFiscalYearEndDate");
  t.is(firstFact.value, "--06-30");

  const context = firstFact.context;
  t.is(context.entity, "0000789019");
  t.deepEqual(context.segments, []);

  const period = context.period;
  t.is(period.instant, undefined);
  t.is(period.start_date, undefined);
  t.is(period.end_date, undefined);
});

test("parse form 13f from native", async (t) => {
  const startTime = Date.now();

  const file = fs.readFileSync("./__test__/form13f.xml", "utf8");
  const result = parseForm13F(file);

  const endTime = Date.now();
  console.log("Parsed Form 13F:", endTime - startTime, "ms");

  t.is(result.schemaVersion, "X0202");

  const headerData = result.headerData;
  t.is(headerData.submissionType, "13F-HR");

  const filerInfo = headerData.filerInfo;
  t.is(filerInfo.periodOfReport, "12-31-2023");
  t.is(filerInfo.liveTestFlag, "LIVE");
  t.is(filerInfo.filer.credentials.cik, "0001067983");

  const formData = result.formData;
  t.is(formData.coverPage.reportCalendarOrQuarter, "12-31-2023");
  t.is(formData.coverPage.isAmendment, false);
  t.is(formData.coverPage.filingManager.name, "Berkshire Hathaway Inc");

  const signatureBlock = formData.signatureBlock;
  t.is(signatureBlock.name, "Marc D. Hamburg");
  t.is(signatureBlock.title, "Senior Vice President");
  t.is(signatureBlock.signatureDate, "02-14-2024");

  const summaryPage = formData.summaryPage;
  t.is(summaryPage.otherIncludedManagersCount, 14);
  t.is(summaryPage.tableEntryTotal, 138);
  t.is(summaryPage.tableValueTotal, 347358074461);
});

test("parse form 13f table from native", async (t) => {
  const startTime = Date.now();

  const file = fs.readFileSync("./__test__/form13f_table.xml", "utf8");
  const result = parseForm13FTable(file);

  const endTime = Date.now();
  console.log("Parsed Form 13F Table:", endTime - startTime, "ms");

  t.is(result.entries.length, 138);

  const entry = result.entries[0];
  t.is(entry.nameOfIssuer, "ALLY FINL INC");
  t.is(entry.titleOfClass, "COM");
  t.is(entry.cusip, "02005N100");
  t.is(entry.value, 444171051);
  t.is(entry.sharesOrPrintAmount.amount, 12719675);
  t.is(entry.sharesOrPrintAmount.sharesOrPrintType, "SH");
  t.is(entry.investmentDiscretion, "DFND");
  t.deepEqual(entry.otherManager, [4]);
  t.is(entry.votingAuthority.sole, 12719675);
  t.is(entry.votingAuthority.shared, 0);
  t.is(entry.votingAuthority.none, 0);
});
