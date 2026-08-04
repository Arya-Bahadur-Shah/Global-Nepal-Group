Put product spec-sheet PDFs here, e.g. zt411.pdf

Then in content/products.json set the product's "specSheet" to the path:
   "specSheet": "/assets/specsheets/zt411.pdf"

Or point straight at the brand's official PDF URL:
   "specSheet": "https://www.zebra.com/.../zt411-tech-specs-en-us.pdf"

Leave "specSheet": null to show a "coming soon" state instead of the download button.
The button opens the PDF in a new browser tab.
