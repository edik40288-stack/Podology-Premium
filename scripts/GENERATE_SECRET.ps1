$bytes = New-Object byte[] 64
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
    $rng.GetBytes($bytes)
    [Convert]::ToBase64String($bytes)
} finally {
    if ($rng) { $rng.Dispose() }
}
