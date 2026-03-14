param(
    [string]$DbHost = "localhost",
    [int]$Port = 5436,
    [string]$Database = "NexusAiDb",
    [string]$Username = "admin",
    [string]$Password = "0977452762Viet"
)

$env:PGPASSWORD = $Password

try {
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        psql "host=$DbHost port=$Port dbname=$Database user=$Username" -f "./data-quality-check.sql"
    }
    else {
        Get-Content "./data-quality-check.sql" | docker exec -i src-nexusaidb psql -U $Username -d $Database
    }
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
