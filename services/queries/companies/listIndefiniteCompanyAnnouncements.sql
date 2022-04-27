DECLARE @_companyId AS INT = @companyId

SELECT count(*) AS totalCount
FROM Announcement
WHERE CompanyID = @_companyId
AND IsOn = 1
AND ExpiresDate IS NULL
AND (convert(date, GETDATE()) >= PostDate OR PostDate IS NULL)

SELECT *
FROM Announcement
WHERE CompanyID = @_companyId
AND IsOn = 1
AND ExpiresDate IS NULL
AND (convert(date, GETDATE()) >= PostDate OR PostDate IS NULL)
ORDER BY IsHighPriority DESC, ExpiresDate DESC, PostDate DESC