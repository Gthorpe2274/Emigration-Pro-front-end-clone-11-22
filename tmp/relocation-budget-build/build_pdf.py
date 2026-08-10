from pathlib import Path
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ["TEMP"]) / "emigration-pro-budget-output" / "Emigration-Pro-Personal-Relocation-Budget-Planner.pdf"
LOGO = ROOT / "public" / "images" / "logo-full.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

NAVY, BLUE, GREEN = HexColor("#173B6C"), HexColor("#24558A"), HexColor("#62A744")
LIGHT_BLUE, LIGHT_GREEN, PALE = HexColor("#EAF1F8"), HexColor("#EAF5E4"), HexColor("#F7F9FC")
INK, MUTED, BORDER, INPUT = HexColor("#203044"), HexColor("#66758A"), HexColor("#D7E0EA"), HexColor("#FFF7D6")
W, H = letter
c = canvas.Canvas(str(OUT), pagesize=letter)
c.setTitle("Emigration Pro Personal Relocation Budget Planner")
form = c.acroForm

def header(title, subtitle, page):
    c.setFillColor(white); c.rect(0, 0, W, H, fill=1, stroke=0)
    if page == 1:
        c.drawImage(ImageReader(str(LOGO)), 42, H-82, width=250, height=53, preserveAspectRatio=True, mask='auto')
        band_y = H-126
    else:
        band_y = H-60
    c.setFillColor(NAVY); c.rect(36, band_y, W-72, 30, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 15); c.drawString(48, band_y+10, title)
    c.setFillColor(LIGHT_BLUE); c.rect(36, band_y-24, W-72, 22, fill=1, stroke=0)
    c.setFillColor(BLUE); c.setFont("Helvetica-Oblique", 8.5); c.drawString(48, band_y-17, subtitle)
    c.setFillColor(MUTED); c.setFont("Helvetica", 8); c.drawRightString(W-40, 24, f"Emigration Pro | Page {page}")

def section(y, text):
    c.setFillColor(BLUE); c.rect(36, y-18, W-72, 22, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 10); c.drawString(46, y-11, text)

def field(name, x, y, w=110, h=17, value=""):
    form.textfield(name=name, x=x, y=y, width=w, height=h, value=value,
                   fontName="Helvetica", fontSize=8, textColor=INK,
                   fillColor=INPUT, borderColor=HexColor("#D7B84B"), borderWidth=0.7,
                   forceBorder=True)

header("PERSONAL RELOCATION BUDGET PLANNER", "Fill in the yellow fields, then transfer your figures to the Excel calculator for automatic totals.", 1)
section(H-176, "YOUR RELOCATION PLAN")
labels = [("Destination country", "destination", ""), ("Local currency", "currency", ""), ("Exchange rate (local per USD)", "rate", ""), ("Months until move", "months_to_move", ""), ("Emergency reserve months", "reserve_months", "6"), ("Contingency percentage", "contingency", "10%")]
y = H-218
for lab, name, val in labels:
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 8.5); c.drawString(48, y+5, lab)
    field(name, 250, y, 135, 18, val); y -= 28
section(y-2, "QUICK SAVINGS SNAPSHOT")
y -= 42
for lab, name in [("Estimated monthly living costs", "snap_monthly"), ("Total one-time move costs", "snap_onetime"), ("Emergency reserve", "snap_reserve"), ("Contingency allowance", "snap_contingency"), ("Recommended pre-move savings", "snap_savings")]:
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 8.5); c.drawString(48, y+5, lab)
    c.setFillColor(MUTED); c.setFont("Helvetica", 8); c.drawRightString(420, y+5, "USD $")
    field(name, 426, y, 125, 18); y -= 28
c.setFillColor(LIGHT_GREEN); c.roundRect(36, 60, W-72, 54, 5, fill=1, stroke=0)
c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 9); c.drawString(48, 94, "Planning note")
c.setFont("Helvetica", 8); c.drawString(48, 80, "Use conservative estimates. Verify current visa, insurance, tax, travel and exchange-rate costs")
c.drawString(48, 68, "before making financial commitments. This worksheet is for general planning, not professional advice.")
c.showPage()

header("MONTHLY LIVING COSTS", "Estimate a normal month in your destination. Include expenses that are easy to overlook.", 2)
section(H-176, "MONTHLY EXPENSE WORKSHEET")
rows = ["Rent or mortgage", "Utilities", "Internet and mobile", "Groceries", "Dining and entertainment", "Public transit / fuel", "Vehicle costs", "Health insurance", "Out-of-pocket medical", "Personal and household", "Childcare / education", "Other monthly costs"]
c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 8); c.drawString(48, H-214, "EXPENSE ITEM"); c.drawString(340, H-214, "MONTHLY USD"); c.drawString(455, H-214, "NOTES")
y = H-240
for i, lab in enumerate(rows, 1):
    c.setFillColor(PALE if i % 2 else white); c.rect(40, y-4, W-80, 25, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont("Helvetica", 8.5); c.drawString(48, y+5, lab)
    field(f"monthly_{i}", 340, y, 90, 18); field(f"monthly_note_{i}", 445, y, 105, 18); y -= 29
c.setFillColor(LIGHT_GREEN); c.rect(40, y-3, W-80, 29, fill=1, stroke=0)
c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 10); c.drawString(48, y+7, "TOTAL MONTHLY LIVING COSTS")
field("monthly_total", 420, y, 130, 20)
c.setFillColor(MUTED); c.setFont("Helvetica-Oblique", 8); c.drawString(48, 56, "Tip: Multiply your monthly total by your desired reserve months to estimate an emergency reserve.")
c.showPage()

header("ONE-TIME RELOCATION COSTS", "Capture the costs required before departure and during your first weeks abroad.", 3)
section(H-176, "ONE-TIME EXPENSE WORKSHEET")
rows = ["Visa and application fees", "Documents, apostilles and translations", "Flights", "Temporary lodging", "Shipping and extra baggage", "Storage", "Security deposit and housing setup", "Legal, tax and relocation advice", "Pet relocation / special needs", "Other one-time expenses"]
c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 8); c.drawString(48, H-214, "EXPENSE ITEM"); c.drawString(340, H-214, "TOTAL USD"); c.drawString(455, H-214, "TIMING / NOTES")
y = H-240
for i, lab in enumerate(rows, 1):
    c.setFillColor(PALE if i % 2 else white); c.rect(40, y-4, W-80, 27, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont("Helvetica", 8.5); c.drawString(48, y+6, lab)
    field(f"onetime_{i}", 340, y, 90, 18); field(f"onetime_note_{i}", 445, y, 105, 18); y -= 31
c.setFillColor(LIGHT_GREEN); c.rect(40, y-3, W-80, 29, fill=1, stroke=0)
c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 10); c.drawString(48, y+7, "TOTAL ONE-TIME MOVE COSTS")
field("onetime_total", 420, y, 130, 20)
y -= 50; section(y, "FINAL FUNDING TARGET")
y -= 37
for lab, name in [("One-time move costs", "final_onetime"), ("Emergency reserve", "final_reserve"), ("Contingency allowance", "final_contingency"), ("RECOMMENDED PRE-MOVE SAVINGS", "final_savings")]:
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 8.5 if "RECOMMENDED" not in lab else 10); c.drawString(48, y+5, lab)
    field(name, 420, y, 130, 19); y -= 28
c.showPage()

header("USD TO LOCAL CURRENCY SCENARIOS", "Stress-test your funding target against possible exchange-rate changes.", 4)
section(H-176, "EXCHANGE-RATE SCENARIO PLANNER")
c.setFillColor(INK); c.setFont("Helvetica-Bold", 9); c.drawString(48, H-214, "Recommended savings in USD")
field("fx_usd_savings", 260, H-226, 120, 18)
c.drawString(48, H-248, "Base exchange rate (local per USD)")
field("fx_base_rate", 260, H-260, 120, 18)
headers = ["Scenario", "Rate adjustment", "Local per USD", "Savings in local currency"]
xs = [48, 240, 345, 445]
y = H-306
c.setFillColor(BLUE); c.rect(40, y-5, W-80, 26, fill=1, stroke=0)
c.setFillColor(white); c.setFont("Helvetica-Bold", 7.5)
for x, text in zip(xs, headers): c.drawString(x, y+5, text)
y -= 31
scenarios = [("USD strengthens 10%", "+10%"), ("USD strengthens 5%", "+5%"), ("Base rate", "0%"), ("USD weakens 5%", "-5%"), ("USD weakens 10%", "-10%")]
for i, (lab, adj) in enumerate(scenarios, 1):
    c.setFillColor(LIGHT_GREEN if i == 3 else PALE); c.rect(40, y-4, W-80, 28, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont("Helvetica-Bold" if i == 3 else "Helvetica", 8); c.drawString(48, y+6, lab); c.drawString(260, y+6, adj)
    field(f"fx_rate_{i}", 340, y, 85, 19); field(f"fx_local_{i}", 445, y, 105, 19); y -= 33
section(y-4, "HOW TO CALCULATE")
c.setFillColor(INK); c.setFont("Helvetica", 8.5)
c.drawString(48, y-38, "Scenario rate = Base exchange rate x (1 + rate adjustment)")
c.drawString(48, y-54, "Savings in local currency = Recommended savings in USD x Scenario rate")
c.setFillColor(LIGHT_BLUE); c.roundRect(40, 74, W-80, 72, 5, fill=1, stroke=0)
c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 9); c.drawString(50, 127, "Important")
c.setFont("Helvetica", 8); c.drawString(50, 111, "Exchange rates can change quickly, and transfer providers may add spreads and fees.")
c.drawString(50, 97, "Confirm live rates and total transfer costs before converting or sending funds.")
c.drawString(50, 83, "The accompanying Excel workbook performs these calculations automatically.")
c.save()

reader = PdfReader(str(OUT))
assert len(reader.pages) == 4
fields = reader.get_fields() or {}
assert len(fields) >= 50, f"Expected fillable fields, found {len(fields)}"
print(f"Created {OUT} with {len(reader.pages)} pages and {len(fields)} fillable fields")
