import { test, expect } from '@playwright/test';

test('EduFlow Reports Terminal Test', async ({ page }) => {
  // 1. Άνοιγμα της σελίδας χρησιμοποιώντας την IP 127.0.0.1 (σταθερή λύση για Codespaces)
  // Περιμένουμε να φορτώσει πλήρως το DOM πριν προχωρήσουμε
  await page.goto('http://127.0.0.1:3000/reports', { waitUntil: 'domcontentloaded' });

  // 2. Έγχυση (Inject) δοκιμαστικών δεδομένων στο localStorage
  await page.evaluate(() => {
    localStorage.setItem("eduflow_students", JSON.stringify([
      { name: "Γιάννης Παπαδόπουλος", grade: "Α' Λυκείου" },
      { name: "Μαρία Κωνσταντινίδου", grade: "Β' Λυκείου" }
    ]));
    localStorage.setItem("eduflow_teachers", JSON.stringify([
      { name: "Ελένη Δημητρίου", subject: "Μαθηματικά" }
    ]));
  });

  // 3. Reload για να διαβάσει η σελίδα τα νέα δεδομένα από το localStorage
  await page.reload({ waitUntil: 'domcontentloaded' });

  // 4. Έλεγχος (Asserts) αν τα δεδομένα εμφανίζονται σωστά στο UI
  await expect(page.locator('text=Γιάννης Παπαδόπουλος')).toBeVisible();
  await expect(page.locator('text=Ελένη Δημητρίου')).toBeVisible();
  
  // 5. Προσομοίωση του Print View και αυτόματη δημιουργία του PDF
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: 'terminal-test-output.pdf', format: 'A4' });

  console.log('🚀 Το τεστ πέτυχε! Το PDF δημιουργήθηκε στο root ως: terminal-test-output.pdf');
});