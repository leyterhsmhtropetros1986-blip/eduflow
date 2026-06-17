# Scheduler Stress Test - Execution Guide

## ⚠️ Important: Execution Limitations

**I cannot execute the stress test directly** because:

1. **No Browser Runtime**: I operate in a Node.js/terminal environment, not a browser
2. **No localStorage Access**: The EduFlow app uses browser localStorage for data persistence
3. **No React Context**: The scheduler requires the React application to be running
4. **No DOM Access**: The UI components need a browser DOM to render

**However**, I've created a complete, production-ready script that **you can execute** in your browser.

---

## 📋 Step-by-Step Execution Instructions

### Prerequisites:
- ✅ EduFlow app running in browser (development or production)
- ✅ Modern browser with DevTools (Chrome, Firefox, Edge)
- ✅ The `run-stress-test.js` file (already created)

---

### Step 1: Start the EduFlow App

```bash
# In terminal, navigate to the app directory
cd /workspaces/eduflow/app

# Start the development server
npm run dev

# Wait for: "Local: http://localhost:3000"
```

---

### Step 2: Open the App in Browser

1. Open your browser
2. Navigate to: `http://localhost:3000`
3. Wait for the app to fully load

---

### Step 3: Open Browser DevTools

**Option A - Keyboard Shortcut:**
- Windows/Linux: Press `F12` or `Ctrl + Shift + I`
- Mac: Press `Cmd + Option + I`

**Option B - Menu:**
- Chrome: Menu → More Tools → Developer Tools
- Firefox: Menu → More Tools → Web Developer Tools
- Edge: Menu → More Tools → Developer Tools

---

### Step 4: Navigate to Console Tab

1. In DevTools, click the **"Console"** tab
2. Clear any existing messages (optional): Click the 🚫 icon or press `Ctrl+L`

---

### Step 5: Load the Stress Test Script

**Option A - Copy/Paste (Recommended):**

1. Open the file: `/workspaces/eduflow/run-stress-test.js`
2. Select all content (`Ctrl+A` or `Cmd+A`)
3. Copy (`Ctrl+C` or `Cmd+C`)
4. Click in the Console tab
5. Paste (`Ctrl+V` or `Cmd+V`)
6. Press `Enter`

**Option B - Drag & Drop:**

1. Drag `run-stress-test.js` file into the Console tab
2. Browser will execute it automatically

---

### Step 6: Verify Data Generation

You should see output like:

```
🚀 EduFlow Scheduler Stress Test - Starting...

📊 Step 1: Generating synthetic dataset...
   ✓ Generated 240 sections (capacity: 6-9 each)
   ✓ Generated 20 teachers (2-3 subjects each, 3-4 days availability)
   ✓ Generated 200 students (2-4 lessons each, 4-5 days availability)
   ✓ Generated 10 rooms
   ✓ Generated 8 lessons (2 hours/week each)

✅ Synthetic dataset generated and saved

⚡ Step 2: Running scheduler...
⚠️  MANUAL STEP REQUIRED:
   1. Click 'Generate Schedule' button in the UI
   2. Wait for completion
   3. Run: analyzeSchedulerResults()
```

---

### Step 7: Generate the Schedule

1. **Navigate to Schedule Page**: Click "Schedule" in the app sidebar
2. **Click "Generate Schedule" Button**: Usually a button with ⚡ or "Generate" text
3. **Wait for Completion**: Watch for completion message (may take 5-15 seconds)
4. **Look for Success Indicator**: Green checkmark or "Schedule generated" message

---

### Step 8: Run the Analysis

Back in the Console tab, type:

```javascript
analyzeSchedulerResults()
```

Press `Enter`

---

### Step 9: Collect Results

The console will display a comprehensive report. **Copy the entire output** by:

1. Right-click in the console
2. Select "Save as..." or manually copy the text
3. Or take screenshots of each section

---

## 📊 Expected Output Structure

```
======================================================================
📊 SCHEDULER STRESS TEST RESULTS
======================================================================

⏱️  PERFORMANCE METRICS:
   Runtime: 8.45 seconds
   Memory Used: 7.23 MB
   Sessions Scheduled: 387

🔍 VALIDATION: CONFLICTS
   ❌ Student Conflicts: 0
   ❌ Student Duplicate Placements: 0
   ❌ Teacher Conflicts: 0
   ❌ Room Conflicts: 0
   ❌ Section Collisions: 0

📋 UNPLACED SESSIONS:
   Total Unplaced/Incomplete: 12 / 240
   First 10:
   - Α1 Μαθηματικά: 0/2h (8 students)
   - Β2 Φυσική: 1/2h (6 students)
   ...

📊 STUDENT GAP STATISTICS:
   Students with zero gaps: 156 / 200 (78.0%)
   Average gap: 0.34 hours
   Maximum gap: 3 hours

   📉 Top 10 Worst Student Schedules (by total gaps):
   1. S042 Παπαδόπουλος Γιώργος: 3h total gaps, 2h max gap (4 sessions)
   2. S089 Κωνσταντίνου Μαρία: 2h total gaps, 1h max gap (3 sessions)
   ...

📊 TEACHER GAP STATISTICS:
   Average gap: 1.23 hours
   Maximum gap: 4 hours

   📉 Top 10 Worst Teacher Schedules (by total gaps):
   1. Παπαδόπουλος Γιώργος: 4h total gaps, 2h max gap (12 sessions)
   2. Κωνσταντίνου Μαρία: 3h total gaps, 1h max gap (10 sessions)
   ...

🔧 BOTTLENECKS DISCOVERED:
   ⚠️  Oversubscribed Sections: 5
      - Α1 - Μαθηματικά (Α Γυμνασίου): 10/8 (+2)
      - Β2 - Φυσική (Β Γυμνασίου): 9/7 (+2)
   ⚠️  Overloaded Teachers (>15 sessions): 2
      - Παπαδόπουλος Γιώργος: 18 sessions
   ⚠️  Students with Limited Availability (<3 days): 15

======================================================================
📊 SUMMARY TABLE
======================================================================
┌─────────────┬──────────────────────────────────────────────────────┐
│   (index)   │                       Values                         │
├─────────────┼──────────────────────────────────────────────────────┤
│   Dataset   │ { Students: 200, Teachers: 20, Sections: 240, ... } │
│ Performance │ { Runtime: '8.45s', Memory: '7.23MB', ... }          │
│  Conflicts  │ { 'Student Conflicts': 0, ... }                      │
│  Unplaced   │ { 'Incomplete Sessions': 12, ... }                   │
│Student Gaps │ { 'Zero Gaps': '156 (78.0%)', ... }                  │
│Teacher Gaps │ { Average: '1.23h', Maximum: '4h' }                  │
│ Bottlenecks │ [ 'Oversubscribed sections: 5', ... ]                │
└─────────────┴──────────────────────────────────────────────────────┘

======================================================================
✅ STRESS TEST COMPLETE
======================================================================
```

---

## 🔍 Where to Find Results

### In Browser Console:
- **Scroll up** to see all sections
- **Right-click** → "Save as..." to export
- **Take screenshots** of each section

### In Browser DevTools:
- Results are logged to console
- Can be copied as text
- Can be saved as log file

### Return Value:
The function returns an object with all data:

```javascript
const results = analyzeSchedulerResults();

// Access specific data:
console.log(results.summary);
console.log(results.worstStudents);
console.log(results.worstTeachers);
console.log(results.conflicts);
console.log(results.unplaced);
console.log(results.bottlenecks);
```

---

## 📝 Saving Results

### Method 1: Copy Console Output
1. Right-click in console
2. Select all text
3. Copy and paste into a text file

### Method 2: Export as JSON
```javascript
// In console, after running analyzeSchedulerResults():
const results = analyzeSchedulerResults();
const json = JSON.stringify(results, null, 2);
console.log(json);
// Copy the JSON output
```

### Method 3: Download as File
```javascript
// In console:
const results = analyzeSchedulerResults();
const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'stress-test-results.json';
a.click();
```

---

## ⚠️ Troubleshooting

### Issue: "analyzeSchedulerResults is not defined"
**Solution**: Run the stress test script first (Step 5)

### Issue: "Cannot read property 'length' of null"
**Solution**: Make sure you clicked "Generate Schedule" in the UI (Step 7)

### Issue: Script doesn't run
**Solution**: 
- Check for syntax errors in console
- Make sure you copied the entire file
- Try refreshing the page and starting over

### Issue: No schedule generated
**Solution**:
- Check if there are validation errors in the UI
- Look for error messages in console
- Verify data was generated (check localStorage)

### Issue: Performance is slow
**Solution**:
- This is expected with 200 students
- Wait 10-20 seconds for completion
- Check browser memory usage

---

## 🎯 Quick Reference

| Step | Action | Location |
|------|--------|----------|
| 1 | Start app | Terminal: `npm run dev` |
| 2 | Open browser | `http://localhost:3000` |
| 3 | Open DevTools | Press `F12` |
| 4 | Go to Console | Click "Console" tab |
| 5 | Load script | Paste `run-stress-test.js` |
| 6 | Verify data | See generation messages |
| 7 | Generate schedule | Click button in UI |
| 8 | Run analysis | Type: `analyzeSchedulerResults()` |
| 9 | Collect results | Copy console output |

---

## 📞 Support

If you encounter issues:

1. **Check Console for Errors**: Red error messages indicate problems
2. **Verify Data**: Run `localStorage.getItem('eduflow_students')` to check data
3. **Clear and Retry**: Run `localStorage.clear()` and start over
4. **Check Browser**: Use Chrome/Firefox/Edge (latest versions)

---

## ✅ Success Indicators

You'll know it worked when you see:

- ✅ "Synthetic dataset generated and saved"
- ✅ Schedule page shows sessions in the UI
- ✅ Console shows "STRESS TEST COMPLETE"
- ✅ Summary table displays all metrics
- ✅ No red error messages in console

---

**Created**: 2026-06-17  
**Script**: `/workspaces/eduflow/run-stress-test.js`  
**Execution**: Browser console only (requires running EduFlow app)
