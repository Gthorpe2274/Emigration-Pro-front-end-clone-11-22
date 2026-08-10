from pathlib import Path
import os
from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject, NameObject

src = Path(os.environ["TEMP"]) / "emigration-pro-budget-output" / "Emigration-Pro-Personal-Relocation-Budget-Planner.pdf"
fixed = Path(os.environ["TEMP"]) / "emigration-pro-budget-output" / "Emigration-Pro-Personal-Relocation-Budget-Planner-Editable.pdf"
test = Path(os.environ["TEMP"]) / "emigration-pro-budget-output" / "form-entry-test.pdf"

reader = PdfReader(str(src))
fields = reader.get_fields() or {}
widgets = []
for page_no, page in enumerate(reader.pages, 1):
    for ref in page.get("/Annots", []):
        obj = ref.get_object()
        if obj.get("/Subtype") == "/Widget":
            parent = obj.get("/Parent")
            effective = parent.get_object() if parent else obj
            widgets.append((page_no, effective.get("/T"), int(effective.get("/Ff", 0)), bool(obj.get("/AP", {}).get("/N"))))

assert fields, "No canonical form fields found"
assert len(widgets) == len(fields), f"Widget/field mismatch: {len(widgets)} vs {len(fields)}"
assert all(flags & 1 == 0 for _, _, flags, _ in widgets), "One or more fields are read-only"
assert all(has_ap for _, _, _, has_ap in widgets), "One or more widgets lack appearance streams"

writer = PdfWriter()
writer.clone_document_from_reader(reader)
acro = writer.root_object[NameObject("/AcroForm")]
acro[NameObject("/NeedAppearances")] = BooleanObject(True)
with fixed.open("wb") as f:
    writer.write(f)

# Prove actual entry works by writing values through the canonical field tree.
check_reader = PdfReader(str(fixed))
test_writer = PdfWriter()
test_writer.clone_document_from_reader(check_reader)
sample = {
    "destination": "Portugal",
    "currency": "EUR",
    "rate": "0.92",
    "monthly_1": "1500",
    "monthly_total": "3480",
    "final_savings": "37378",
}
test_writer.update_page_form_field_values(None, sample, auto_regenerate=True)
with test.open("wb") as f:
    test_writer.write(f)

verify = PdfReader(str(test))
verified_fields = verify.get_fields() or {}
for name, expected in sample.items():
    actual = str(verified_fields[name].get("/V", ""))
    assert actual == expected, f"{name}: expected {expected}, got {actual}"

print(f"PASS: {len(fields)} canonical editable fields, {len(widgets)} widgets, all with appearances")
print("PASS: sample user entries were written and read back correctly")
print(f"Editable output: {fixed}")
