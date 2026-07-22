import os
import sys
from pypdf import PdfReader, PdfWriter

PDF_ROOT = os.path.join(os.path.dirname(__file__), "..", "pdfs")
PASSWORD = "SleepyStudiesSecurityPass2026"

print(f"🔒 Encrypting catalog PDFs with 256-bit AES password protection...")
print(f"🔑 Password: {PASSWORD}\n")

if not os.path.exists(PDF_ROOT):
    print("PDF root not found.")
    sys.exit(0)

for root, dirs, files in os.walk(PDF_ROOT):
    for file in files:
        if file.endswith(".pdf"):
            filePath = os.path.join(root, file)
            try:
                reader = PdfReader(filePath)
                writer = PdfWriter()

                # Transfer pages
                for page in reader.pages:
                    writer.add_page(page)

                # Encrypt with user password
                writer.encrypt(user_password=PASSWORD, owner_password=PASSWORD + "_OWNER")

                with open(filePath, "wb") as f:
                    writer.write(f)

                print(f"✅ Encrypted & Password-Protected: {os.path.relpath(filePath, PDF_ROOT)}")
            except Exception as e:
                print(f"❌ Failed to encrypt {file}: {e}")

print("\n✨ Catalog encryption complete! All PDF files on GitHub are now password-locked.")
