import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve("../..");
const outDir = path.join(process.env.TEMP, "emigration-pro-budget-output");
const previewDir = path.join(process.env.TEMP, "emigration-pro-budget-previews");
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const NAVY = "#173B6C";
const BLUE = "#24558A";
const GREEN = "#62A744";
const LIGHT_GREEN = "#EAF5E4";
const LIGHT_BLUE = "#EAF1F8";
const PALE = "#F7F9FC";
const INK = "#203044";
const MUTED = "#66758A";
const BORDER = "#D7E0EA";
const INPUT = "#FFF7D6";

const wb = Workbook.create();
const dash = wb.worksheets.add("Dashboard");
const budget = wb.worksheets.add("Budget Planner");
const fx = wb.worksheets.add("Currency Scenarios");
for (const ws of [dash, budget, fx]) { ws.showGridLines = false; }

const logoPath = path.join(root, "public", "images", "logo-full.png");
const logoData = `data:image/png;base64,${(await fs.readFile(logoPath)).toString("base64")}`;

function titleBlock(ws, subtitle) {
  ws.getRange("A1:H4").format.fill = "#FFFFFF";
  ws.images.add({ dataUrl: logoData, anchor: { from: { row: 0, col: 0 }, extent: { widthPx: 300, heightPx: 72 } } });
  ws.getRange("A5:H5").merge();
  ws.getRange("A5").values = [["PERSONAL RELOCATION BUDGET CALCULATOR"]];
  ws.getRange("A5:H5").format = { fill: NAVY, font: { color: "#FFFFFF", bold: true, size: 18 }, rowHeight: 32, verticalAlignment: "center", horizontalAlignment: "left" };
  ws.getRange("A6:H6").merge();
  ws.getRange("A6").values = [[subtitle]];
  ws.getRange("A6:H6").format = { fill: LIGHT_BLUE, font: { color: BLUE, italic: true, size: 10 }, rowHeight: 24, verticalAlignment: "center", horizontalAlignment: "left" };
}

function section(ws, cellRange, label) {
  ws.getRange(cellRange).merge();
  const cell = cellRange.split(":")[0];
  ws.getRange(cell).values = [[label]];
  ws.getRange(cellRange).format = { fill: BLUE, font: { color: "#FFFFFF", bold: true, size: 11 }, rowHeight: 24, verticalAlignment: "center" };
}

titleBlock(dash, "Enter your assumptions in the yellow cells. All totals update automatically.");
dash.getRange("A8:B8").merge(); dash.getRange("A8").values = [["YOUR RELOCATION PLAN"]];
dash.getRange("A8:B8").format = { fill: GREEN, font: { color: "#FFFFFF", bold: true, size: 11 } };
dash.getRange("A9:B14").values = [
  ["Destination country", "Portugal"], ["Local currency", "EUR"], ["Exchange rate (local per USD)", 0.92],
  ["Months until move", 12], ["Months of emergency reserve", 6], ["Contingency rate", 0.1]
];
dash.getRange("A9:A14").format = { fill: PALE, font: { color: INK, bold: true } };
dash.getRange("B9:B14").format = { fill: INPUT, font: { color: INK }, borders: { preset: "outside", style: "thin", color: "#D7B84B" } };
dash.getRange("B11").format.numberFormat = "0.0000";
dash.getRange("B12:B13").format.numberFormat = "0";
dash.getRange("B14").format.numberFormat = "0%";
dash.getRange("B11:B14").dataValidation = { rule: { type: "decimal", operator: "greaterThan", formula1: 0 } };

section(dash, "D8:H8", "RELOCATION FUNDING SNAPSHOT");
dash.getRange("D9:F13").values = [["Monthly living costs"], ["One-time move costs"], ["Emergency reserve"], ["Contingency allowance"], ["Recommended pre-move savings"]];
dash.getRange("G9:G13").formulas = [
  ["='Budget Planner'!$E$25"], ["='Budget Planner'!$E$39"], ["='Budget Planner'!$E$42"], ["='Budget Planner'!$E$43"], ["='Budget Planner'!$E$44"]
];
dash.getRange("H9:H13").formulas = [
  ["=G9*$B$11"], ["=G10*$B$11"], ["=G11*$B$11"], ["=G12*$B$11"], ["=G13*$B$11"]
];
dash.getRange("D9:F13").merge(true);
dash.getRange("D9:F13").format = { fill: PALE, font: { color: INK, bold: true }, borders: { insideHorizontal: { style: "thin", color: BORDER } } };
dash.getRange("G9:H13").format = { fill: "#FFFFFF", font: { color: INK, bold: true, size: 11 }, numberFormat: '"$"#,##0', borders: { preset: "all", style: "thin", color: BORDER } };
dash.getRange("H9:H13").format.numberFormat = '#,##0 "local"';
dash.getRange("D13:H13").format = { fill: LIGHT_GREEN, font: { color: NAVY, bold: true, size: 13 }, borders: { preset: "outside", style: "medium", color: GREEN } };

section(dash, "A17:H17", "HOW TO USE THIS CALCULATOR");
dash.getRange("A18:H22").merge(true);
dash.getRange("A18:A22").values = [
  ["1. Complete the yellow planning assumptions above."],
  ["2. Enter monthly and one-time expenses on the Budget Planner sheet."],
  ["3. Review exchange-rate stress tests on Currency Scenarios."],
  ["4. Aim to fund the recommended savings total before departure."],
  ["Tip: Use conservative estimates and confirm current visa, insurance, tax and travel costs with qualified sources."]
];
dash.getRange("A18:H22").format = { fill: "#FFFFFF", font: { color: MUTED, size: 10 }, rowHeight: 23, wrapText: true };
dash.freezePanes.freezeRows(6);
dash.getRange("A1:H22").format.font.name = "Aptos";
dash.getRange("A:A").format.columnWidth = 28; dash.getRange("B:B").format.columnWidth = 18;
dash.getRange("C:C").format.columnWidth = 3; dash.getRange("D:F").format.columnWidth = 14;
dash.getRange("G:H").format.columnWidth = 16;

titleBlock(budget, "Build your monthly lifestyle budget and one-time relocation fund in USD.");
budget.getRange("A8:E8").values = [["CATEGORY", "EXPENSE ITEM", "YOUR ESTIMATE", "FREQUENCY / NOTES", "ANNUAL OR TOTAL"]];
budget.getRange("A8:E8").format = { fill: BLUE, font: { color: "#FFFFFF", bold: true }, rowHeight: 28, horizontalAlignment: "center", verticalAlignment: "center" };
const monthly = [
  ["Housing", "Rent or mortgage", 1500, "Monthly"], ["Housing", "Utilities", 180, "Monthly"], ["Housing", "Internet and mobile", 90, "Monthly"],
  ["Food", "Groceries", 500, "Monthly"], ["Food", "Dining and entertainment", 250, "Monthly"],
  ["Transportation", "Public transit / fuel", 160, "Monthly"], ["Transportation", "Vehicle costs", 0, "Monthly"],
  ["Healthcare", "Health insurance", 350, "Monthly"], ["Healthcare", "Out-of-pocket medical", 100, "Monthly"],
  ["Lifestyle", "Personal and household", 200, "Monthly"], ["Lifestyle", "Childcare / education", 0, "Monthly"], ["Lifestyle", "Other monthly costs", 150, "Monthly"]
];
budget.getRange("A9:D20").values = monthly;
budget.getRange("E9").formulas = [["=C9*12"]]; budget.getRange("E9:E20").fillDown();
budget.getRange("A9:B20").format = { fill: PALE, font: { color: INK } };
budget.getRange("C9:C20").format = { fill: INPUT, font: { color: INK }, numberFormat: '"$"#,##0', borders: { preset: "all", style: "thin", color: "#D7B84B" } };
budget.getRange("D9:D20").format = { fill: "#FFFFFF", font: { color: MUTED, italic: true } };
budget.getRange("E9:E20").format = { fill: LIGHT_BLUE, font: { color: NAVY }, numberFormat: '"$"#,##0' };
budget.getRange("A22:D22").merge(); budget.getRange("A22").values = [["TOTAL MONTHLY LIVING COSTS"]];
budget.getRange("E22").formulas = [["=SUM(C9:C20)"]];
budget.getRange("A22:E22").format = { fill: LIGHT_GREEN, font: { color: NAVY, bold: true, size: 12 }, numberFormat: '"$"#,##0', borders: { preset: "outside", style: "medium", color: GREEN }, rowHeight: 28 };
budget.getRange("A24:D24").merge(); budget.getRange("A24").values = [["ANNUAL LIVING COSTS"]];
budget.getRange("E24").formulas = [["=SUM(E9:E20)"]];
budget.getRange("A24:E24").format = { fill: LIGHT_BLUE, font: { color: NAVY, bold: true }, numberFormat: '"$"#,##0', rowHeight: 25 };
budget.getRange("A25:D25").merge(); budget.getRange("A25").values = [["MONTHLY LIVING COSTS (LINKED TO DASHBOARD)"]];
budget.getRange("E25").formulas = [["=E22"]]; budget.getRange("A25:E25").format = { font: { color: MUTED, italic: true }, numberFormat: '"$"#,##0' };

budget.getRange("A28:E28").values = [["CATEGORY", "ONE-TIME EXPENSE", "YOUR ESTIMATE", "TIMING / NOTES", "TOTAL"]];
budget.getRange("A28:E28").format = { fill: BLUE, font: { color: "#FFFFFF", bold: true }, rowHeight: 28, horizontalAlignment: "center" };
const once = [
  ["Immigration", "Visa and application fees", 1200, "Before departure"], ["Immigration", "Documents, apostilles and translations", 600, "Before departure"],
  ["Travel", "Flights", 1800, "Departure"], ["Travel", "Temporary lodging", 2400, "Arrival"],
  ["Moving", "Shipping and baggage", 1800, "Before departure"], ["Moving", "Storage", 600, "Initial period"],
  ["Housing", "Security deposit and setup", 3200, "Arrival"], ["Professional", "Legal, tax and relocation advice", 1000, "As needed"],
  ["Other", "Pet relocation / special needs", 0, "As needed"], ["Other", "Other one-time expenses", 500, "As needed"]
];
budget.getRange("A29:D38").values = once;
budget.getRange("E29").formulas = [["=C29"]]; budget.getRange("E29:E38").fillDown();
budget.getRange("A29:B38").format = { fill: PALE, font: { color: INK } };
budget.getRange("C29:C38").format = { fill: INPUT, numberFormat: '"$"#,##0', borders: { preset: "all", style: "thin", color: "#D7B84B" } };
budget.getRange("D29:D38").format = { font: { color: MUTED, italic: true } };
budget.getRange("E29:E38").format = { fill: LIGHT_BLUE, numberFormat: '"$"#,##0' };
budget.getRange("A39:D39").merge(); budget.getRange("A39").values = [["TOTAL ONE-TIME MOVE COSTS"]]; budget.getRange("E39").formulas = [["=SUM(E29:E38)"]];
budget.getRange("A39:E39").format = { fill: LIGHT_GREEN, font: { color: NAVY, bold: true, size: 12 }, numberFormat: '"$"#,##0', borders: { preset: "outside", style: "medium", color: GREEN }, rowHeight: 28 };

budget.getRange("A42:D42").merge(); budget.getRange("A42").values = [["EMERGENCY RESERVE"]]; budget.getRange("E42").formulas = [["=E22*'Dashboard'!$B$13"]];
budget.getRange("A43:D43").merge(); budget.getRange("A43").values = [["CONTINGENCY ALLOWANCE"]]; budget.getRange("E43").formulas = [["=(E39+E42)*'Dashboard'!$B$14"]];
budget.getRange("A44:D44").merge(); budget.getRange("A44").values = [["RECOMMENDED PRE-MOVE SAVINGS"]]; budget.getRange("E44").formulas = [["=E39+E42+E43"]];
budget.getRange("A42:E43").format = { fill: LIGHT_BLUE, font: { color: NAVY, bold: true }, numberFormat: '"$"#,##0', rowHeight: 25 };
budget.getRange("A44:E44").format = { fill: GREEN, font: { color: "#FFFFFF", bold: true, size: 14 }, numberFormat: '"$"#,##0', borders: { preset: "outside", style: "medium", color: NAVY }, rowHeight: 32 };
budget.getRange("C9:C20").dataValidation = { rule: { type: "decimal", operator: "greaterThanOrEqual", formula1: 0 } };
budget.getRange("C29:C38").dataValidation = { rule: { type: "decimal", operator: "greaterThanOrEqual", formula1: 0 } };
budget.freezePanes.freezeRows(8);
budget.getRange("A1:E44").format.font.name = "Aptos";
budget.getRange("A:A").format.columnWidth = 18; budget.getRange("B:B").format.columnWidth = 38; budget.getRange("C:C").format.columnWidth = 18; budget.getRange("D:D").format.columnWidth = 24; budget.getRange("E:E").format.columnWidth = 19;

titleBlock(fx, "Compare your savings target when the U.S. dollar strengthens or weakens.");
fx.getRange("A8:E8").values = [["SCENARIO", "RATE VS. BASE", "LOCAL PER USD", "SAVINGS IN USD", "SAVINGS IN LOCAL CURRENCY"]];
fx.getRange("A8:E8").format = { fill: BLUE, font: { color: "#FFFFFF", bold: true }, rowHeight: 30, horizontalAlignment: "center", wrapText: true };
fx.getRange("A9:B13").values = [["USD strengthens 10%", 1.1], ["USD strengthens 5%", 1.05], ["Base rate", 1], ["USD weakens 5%", 0.95], ["USD weakens 10%", 0.9]];
fx.getRange("C9").formulas = [["='Dashboard'!$B$11*B9"]]; fx.getRange("C9:C13").fillDown();
fx.getRange("D9").formulas = [["='Budget Planner'!$E$44"]]; fx.getRange("D9:D13").fillDown();
fx.getRange("E9").formulas = [["=C9*D9"]]; fx.getRange("E9:E13").fillDown();
fx.getRange("A9:A13").format = { fill: PALE, font: { color: INK, bold: true } };
fx.getRange("B9:C13").format = { fill: "#FFFFFF", font: { color: INK }, horizontalAlignment: "center" };
fx.getRange("B9:B13").format.numberFormat = "0%"; fx.getRange("C9:C13").format.numberFormat = "0.0000";
fx.getRange("D9:E13").format = { fill: LIGHT_BLUE, font: { color: NAVY, bold: true }, numberFormat: '"$"#,##0' };
fx.getRange("A11:E11").format = { fill: LIGHT_GREEN, font: { color: NAVY, bold: true }, borders: { preset: "outside", style: "medium", color: GREEN } };
section(fx, "A16:E16", "INTERPRETING THE SCENARIOS");
fx.getRange("A17:E20").merge(true);
fx.getRange("A17:A20").values = [
  ["A stronger U.S. dollar buys more local currency; a weaker dollar buys less."],
  ["The USD savings requirement remains constant because your inputs are entered in USD."],
  ["Use the local-currency column to see purchasing power at each exchange rate."],
  ["Exchange rates fluctuate. Recheck current rates before transferring money or booking major expenses."]
];
fx.getRange("A17:E20").format = { fill: "#FFFFFF", font: { color: MUTED }, rowHeight: 24, wrapText: true };
fx.freezePanes.freezeRows(8);
fx.getRange("A1:E20").format.font.name = "Aptos";
fx.getRange("A:A").format.columnWidth = 28; fx.getRange("B:B").format.columnWidth = 18; fx.getRange("C:C").format.columnWidth = 18; fx.getRange("D:E").format.columnWidth = 24;

for (const [sheetName, range] of [["Dashboard", "A1:H22"], ["Budget Planner", "A1:E44"], ["Currency Scenarios", "A1:E20"]]) {
  const preview = await wb.render({ sheetName, range, scale: 1.4, format: "png" });
  await fs.writeFile(path.join(previewDir, `${sheetName.replaceAll(" ", "_")}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const inspect = await wb.inspect({ kind: "table", range: "Budget Planner!A39:E44", include: "values,formulas", tableMaxRows: 10, tableMaxCols: 6 });
console.log(inspect.ndjson);
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "final formula error scan" });
console.log(errors.ndjson);
const file = await SpreadsheetFile.exportXlsx(wb);
await file.save(path.join(outDir, "Emigration-Pro-Personal-Relocation-Budget-Calculator.xlsx"));
