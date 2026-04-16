# Test Sign-Up Endpoint
Write-Host "🧪 Testing Sign-Up Endpoint..." -ForegroundColor Cyan
Write-Host ""

$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$randomPhone = "+252" + (Get-Random -Minimum 600000000 -Maximum 699999999)

$testUser = @{
    email = "testuser$timestamp@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
    phoneNumber = $randomPhone
    role = "customer"
} | ConvertTo-Json

Write-Host "📝 Test User Data:" -ForegroundColor Yellow
Write-Host "   Email: testuser$timestamp@example.com"
Write-Host "   Password: password123"
Write-Host "   Phone: $randomPhone"
Write-Host ""

Write-Host "📡 Sending POST request to http://localhost:5000/api/auth/register..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method Post `
        -Body $testUser `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "✅ Sign-Up Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    
    if ($response.success) {
        Write-Host "User Created Successfully!" -ForegroundColor Green
        Write-Host "User ID: $($response.data.user.id)"
        Write-Host "Email: $($response.data.user.email)"
        Write-Host "Phone: $($response.data.user.phoneNumber)"
        Write-Host ""
        
        Write-Host "🧪 Now testing login..." -ForegroundColor Cyan
        Write-Host ""
        
        $loginData = @{
            email = "testuser$timestamp@example.com"
            password = "password123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
            -Method Post `
            -Body $loginData `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        Write-Host "✅ Login Successful!" -ForegroundColor Green
        Write-Host "📦 Login Response:" -ForegroundColor Yellow
        $loginResponse | ConvertTo-Json -Depth 10
    }
    
} catch {
    Write-Host "❌ Request Failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "📦 Error Response:" -ForegroundColor Yellow
        $responseBody | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
}
