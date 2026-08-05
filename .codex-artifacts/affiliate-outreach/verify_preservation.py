from pathlib import Path
from zipfile import ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parent
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def paragraphs(path):
    with ZipFile(path) as package:
        root = etree.fromstring(package.read("word/document.xml"))
    return root.xpath("//w:body/w:p", namespaces=NS)


reference = paragraphs(ROOT / "reference.docx")
output = paragraphs(ROOT / "EmigrationPro_Affiliate_Outreach_Clean.docx")

print(f"paragraph counts: {len(reference)} / {len(output)}")
print(
    "letter XML identical:",
    all(
        etree.tostring(a, method="c14n") == etree.tostring(b, method="c14n")
        for a, b in zip(reference[18:], output[18:])
    ),
)
print(
    "manual page break retained:",
    bool(output[18].xpath('.//w:br[@w:type="page"]', namespaces=NS)),
)
