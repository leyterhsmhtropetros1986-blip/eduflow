# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app/tests/reports.spec.ts >> EduFlow Reports Terminal Test
- Location: app/tests/reports.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Γιάννης Παπαδόπουλος')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Γιάννης Παπαδόπουλος')

```

```yaml
- main:
  - complementary:
    - text: EduFlow Smart Tutoring ERP
    - navigation:
      - link "Dashboard":
        - /url: /
      - link "Μαθητές":
        - /url: /students
      - link "Καθηγητές":
        - /url: /teachers
      - link "Τάξεις":
        - /url: /classes
      - link "Αίθουσες":
        - /url: /rooms
      - link "Μαθήματα":
        - /url: /courses
      - link "Scheduler":
        - /url: /schedule
      - link "Παρουσίες":
        - /url: /attendance
      - link "CRM":
        - /url: /crm
      - link "Γονείς":
        - /url: /parents
      - link "Αναφορές":
        - /url: /reports
    - text: AI Scheduler
    - paragraph: Δημιουργία προγράμματος χωρίς συγκρούσεις.
    - link "Άνοιγμα":
      - /url: /schedule
  - main:
    - heading "Αναφορές" [level=1]
    - paragraph: Συγκεντρωτικά στοιχεία.
    - textbox "Αναζήτηση..."
    - button
    - text: Λ
    - heading "Εξαγωγή Αναφορών" [level=2]
    - paragraph: Πάτα το κουμπί για αποθήκευση σε PDF.
    - button "Εκτύπωση σε PDF"
    - heading "Αναφορά EduFlow - 6/11/2026" [level=1]
    - heading "Μαθητές" [level=2]
    - table:
      - rowgroup:
        - row "Όνομα Τάξη":
          - columnheader "Όνομα"
          - columnheader "Τάξη"
      - rowgroup:
        - row "Δεν υπάρχουν καταχωρημένοι μαθητές.":
          - cell "Δεν υπάρχουν καταχωρημένοι μαθητές."
    - heading "Καθηγητές" [level=2]
    - table:
      - rowgroup:
        - row "Όνομα Μάθημα":
          - columnheader "Όνομα"
          - columnheader "Μάθημα"
      - rowgroup:
        - row "Δεν υπάρχουν καταχωρημένοι καθηγητές.":
          - cell "Δεν υπάρχουν καταχωρημένοι καθηγητές."
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('EduFlow Reports Terminal Test', async ({ page }) => {
  4  |   // 1. Άνοιγμα της σελίδας χρησιμοποιώντας την IP 127.0.0.1 (σταθερή λύση για Codespaces)
  5  |   // Περιμένουμε να φορτώσει πλήρως το DOM πριν προχωρήσουμε
  6  |   await page.goto('http://127.0.0.1:3000/reports', { waitUntil: 'domcontentloaded' });
  7  | 
  8  |   // 2. Έγχυση (Inject) δοκιμαστικών δεδομένων στο localStorage
  9  |   await page.evaluate(() => {
  10 |     localStorage.setItem("eduflow_students", JSON.stringify([
  11 |       { name: "Γιάννης Παπαδόπουλος", grade: "Α' Λυκείου" },
  12 |       { name: "Μαρία Κωνσταντινίδου", grade: "Β' Λυκείου" }
  13 |     ]));
  14 |     localStorage.setItem("eduflow_teachers", JSON.stringify([
  15 |       { name: "Ελένη Δημητρίου", subject: "Μαθηματικά" }
  16 |     ]));
  17 |   });
  18 | 
  19 |   // 3. Reload για να διαβάσει η σελίδα τα νέα δεδομένα από το localStorage
  20 |   await page.reload({ waitUntil: 'domcontentloaded' });
  21 | 
  22 |   // 4. Έλεγχος (Asserts) αν τα δεδομένα εμφανίζονται σωστά στο UI
> 23 |   await expect(page.locator('text=Γιάννης Παπαδόπουλος')).toBeVisible();
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  24 |   await expect(page.locator('text=Ελένη Δημητρίου')).toBeVisible();
  25 |   
  26 |   // 5. Προσομοίωση του Print View και αυτόματη δημιουργία του PDF
  27 |   await page.emulateMedia({ media: 'print' });
  28 |   await page.pdf({ path: 'terminal-test-output.pdf', format: 'A4' });
  29 | 
  30 |   console.log('🚀 Το τεστ πέτυχε! Το PDF δημιουργήθηκε στο root ως: terminal-test-output.pdf');
  31 | });
```