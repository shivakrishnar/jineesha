DECLARE @_companyId AS INT = @companyId

SELECT count(*) AS totalCount
FROM Announcement
WHERE CompanyID = @_companyId
AND IsOn = 1
AND (convert(date, GETDATE()) >= PostDate OR PostDate IS NULL)
AND convert(date, GETDATE()) <= ExpiresDate

SELECT *
FROM Announcement
WHERE CompanyID = @_companyId
AND IsOn = 1
AND (convert(date, GETDATE()) >= PostDate OR PostDate IS NULL)
AND convert(date, GETDATE()) <= ExpiresDate
ORDER BY IsHighPriority DESC, ExpiresDate DESC, PostDate DESC