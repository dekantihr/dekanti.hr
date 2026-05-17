# Admin Panel CRUD Testing Guide

## Quick Start

1. **Login as Admin**
   - Email: `admin@aromahr.hr`
   - Password: `admin123`

2. **Navigate to Admin Panel**
   - Click on user icon → "Admin Panel"
   - Or go directly to `/admin`

---

## Testing Kuponi (Coupons)

### Create New Coupon
1. Click "Kuponi" in sidebar
2. Click "+ Novi kupon" button
3. Fill in the form:
   - **Kod**: `LJETO2024` (will auto-uppercase)
   - **Tip**: Select "Postotak" or "Fiksni"
   - **Vrijednost**: `10` (for 10% or 10€)
   - **Min. iznos**: `50` (minimum order 50€)
   - **Max. popust**: `20` (only for percentage type)
   - **Max. korištenja**: `100` (optional)
   - **Vrijedi do**: Select date/time (optional)
   - **Aktivan**: Check/uncheck
4. Click "Spremi"
5. ✅ Should see success toast
6. ✅ New coupon appears in grid

### Edit Coupon
1. Click edit icon (pencil) on any coupon card
2. Modify any field
3. Click "Spremi"
4. ✅ Should see success toast
5. ✅ Changes reflected immediately

### Delete Coupon
1. Click delete icon (X) on any coupon card
2. Confirm deletion in dialog
3. ✅ Should see success toast
4. ✅ Coupon removed from grid

### Test Cases
- [ ] Create coupon with all fields filled
- [ ] Create coupon with only required fields (kod, vrijednost)
- [ ] Try creating coupon without kod (should show error)
- [ ] Try creating coupon without vrijednost (should show error)
- [ ] Edit coupon and change type from postotak to fiksni
- [ ] Toggle aktivan status
- [ ] Delete coupon and confirm it's removed from database

---

## Testing Brendovi (Brands)

### Create New Brand
1. Click "Brendovi" in sidebar
2. Click "+ Novi brand" button
3. Fill in the form:
   - **Naziv**: `Tom Ford`
   - **Opis**: `Luksuzni američki brand poznat po intenzivnim mirisima`
   - **Logo URL**: `https://example.com/logo.png` (optional)
   - **Aktivan**: Check/uncheck
4. Click "Spremi"
5. ✅ Should see success toast
6. ✅ New brand appears in grid

### Edit Brand
1. Click edit icon (pencil) on any brand card
2. Modify any field
3. Click "Spremi"
4. ✅ Should see success toast
5. ✅ Changes reflected immediately

### Delete Brand
1. Click delete icon (X) on any brand card
2. Confirm deletion in dialog
3. ✅ Should see success toast
4. ✅ Brand removed from grid

### Test Cases
- [ ] Create brand with all fields
- [ ] Create brand with only name (minimal)
- [ ] Try creating brand without name (should show error)
- [ ] Edit brand description
- [ ] Toggle active status
- [ ] Delete brand and verify products still exist
- [ ] Check product count updates correctly

---

## Testing Kupci (Customers)

### View Customer Details
1. Click "Kupci" in sidebar
2. Click eye icon on any customer row
3. ✅ Modal opens with customer details

### Edit Customer
1. In customer modal, modify fields:
   - **Ime**: Change first name
   - **Prezime**: Change last name
   - **Telefon**: `+385991234567`
   - **Adresa**: `Ilica 123`
   - **Grad**: `Zagreb`
   - **Poštanski broj**: `10000`
   - **Role**: Change between "Kupac" and "Admin"
2. Click "Spremi promjene"
3. ✅ Should see success toast
4. ✅ Changes reflected in table

### Test Cases
- [ ] View customer details
- [ ] Edit customer name
- [ ] Edit customer address
- [ ] Change customer role to admin
- [ ] Try to edit email (should be disabled)
- [ ] Save with empty optional fields
- [ ] Try saving without required fields (should show error)

---

## Testing Recenzije (Reviews)

### Approve Review
1. Click "Recenzije" in sidebar
2. Click green checkmark on pending review
3. ✅ Should see success toast
4. ✅ Review removed from pending list

### Reject Review
1. Click red X on pending review
2. ✅ Should see success toast
3. ✅ Review removed from pending list

### Test Cases
- [ ] Approve a review
- [ ] Reject a review
- [ ] Check "Sve recenzije su obrađene" message when list is empty

---

## Testing Newsletter

### View Subscribers
1. Click "Newsletter" in sidebar
2. ✅ See list of all subscribers
3. ✅ See subscription status (Aktivan/Neaktivan)
4. ✅ See subscription date

### Export CSV
1. Click "Export CSV" button
2. ✅ Should see success toast

### Test Cases
- [ ] View all subscribers
- [ ] Check status badges
- [ ] Export CSV functionality

---

## Testing Narudžbe (Orders)

### View Order Details
1. Click "Narudžbe" in sidebar
2. Click on any order row
3. ✅ Modal opens with order details

### Update Order Status
1. In order modal, change status dropdown
2. ✅ Should see success toast
3. ✅ Status updated in table

### Add Tracking Number
1. In order modal, enter tracking number
2. Click save button
3. ✅ Should see success toast
4. ✅ Tracking number saved

### Test Cases
- [ ] View order details
- [ ] Change order status
- [ ] Add tracking number
- [ ] Update existing tracking number

---

## Common Issues & Solutions

### Issue: "Greška pri učitavanju podataka"
**Solution:** Check Supabase connection in `.env` file

### Issue: Modal doesn't close
**Solution:** Click outside modal or X button

### Issue: Changes not saving
**Solution:** Check browser console for errors, verify Supabase permissions

### Issue: "Greška pri spremanju"
**Solution:** Check required fields are filled, verify database constraints

---

## Database Verification

After testing, verify in Supabase dashboard:

### Coupons Table
```sql
SELECT * FROM coupons ORDER BY created_at DESC;
```

### Brands Table
```sql
SELECT * FROM brands ORDER BY naziv;
```

### Users Table
```sql
SELECT id, ime, prezime, email, role FROM users ORDER BY created_at DESC;
```

---

## Performance Testing

### Load Testing
1. Create 10+ coupons
2. Create 10+ brands
3. Check if grid layout remains responsive
4. Verify loading states work correctly

### Concurrent Editing
1. Open two browser windows
2. Edit same item in both
3. Verify last save wins
4. Check for race conditions

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through form fields
- [ ] Enter to submit forms
- [ ] Escape to close modals
- [ ] Arrow keys in dropdowns

### Screen Reader
- [ ] All labels are read correctly
- [ ] Error messages are announced
- [ ] Success toasts are announced

---

## Mobile Testing

### Responsive Design
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Verify modals are scrollable
- [ ] Check touch targets are large enough

---

## Edge Cases

### Coupons
- [ ] Create coupon with 100% discount
- [ ] Create coupon with 0€ minimum
- [ ] Create coupon with past expiration date
- [ ] Create coupon with very long code (50 chars)

### Brands
- [ ] Create brand with very long name (100 chars)
- [ ] Create brand with special characters in name
- [ ] Create brand with invalid logo URL

### Customers
- [ ] Edit customer with no address
- [ ] Change admin to kupac and back
- [ ] Edit customer with very long name

---

## Success Criteria

✅ All CRUD operations work without errors
✅ Data persists in Supabase database
✅ UI updates immediately after changes
✅ Toast notifications appear for all actions
✅ Loading states prevent duplicate submissions
✅ Validation prevents invalid data
✅ Modals close properly
✅ No console errors
✅ Responsive on all screen sizes
✅ Accessible via keyboard

---

## Reporting Issues

If you find any issues:

1. **Note the exact steps** to reproduce
2. **Check browser console** for errors
3. **Check Supabase logs** for database errors
4. **Take screenshots** if UI issue
5. **Note browser and OS** version

---

## Next Steps After Testing

1. ✅ Verify all test cases pass
2. ✅ Fix any issues found
3. ✅ Test on different browsers (Chrome, Firefox, Safari)
4. ✅ Test on different devices (desktop, tablet, mobile)
5. ✅ Get user feedback
6. ✅ Deploy to production

---

**Happy Testing! 🎉**
