# Add Sample User and Transaction to Database
# Run this script from PowerShell

Write-Host "Adding sample user and transactions to database..." -ForegroundColor Cyan

# Run the SQL script
$env:PGPASSWORD = "Mohamed@123"
psql -U postgres -d ganacsade_db -f "add_sample_data.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Sample data added successfully!" -ForegroundColor Green
    Write-Host "`nUser Details:" -ForegroundColor Yellow
    Write-Host "  Email: ahmed.mohamed@example.com"
    Write-Host "  Password: password123"
    Write-Host "  Role: customer"
    Write-Host "  Status: active"
    Write-Host "`nTransactions:" -ForegroundColor Yellow
    Write-Host "  TXN-2025-0000001: $299.99 (EVC-Plus)"
    Write-Host "  TXN-2025-0000002: $599.98 (Waafi Pay)"
    Write-Host "  TXN-2025-0000003: -$89.99 (Refund)"
    Write-Host "`nYou can now view these in the admin dashboard!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error adding sample data. Check the error messages above." -ForegroundColor Red
}
