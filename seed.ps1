$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/seed" -Method POST -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 201) {
    Write-Host "Admin Seeded Successfully"
} elseif ($response.StatusCode -eq 400) {
    Write-Host "Admin Already Exists"
} else {
    Write-Host "Seeding Failed: $($response.StatusCode)"
}
