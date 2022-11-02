DECLARE @_companyId AS INT = @companyId

SELECT count(*) AS totalCount
FROM Announcement
WHERE CompanyID = @_companyId
AND IsOn = 1
AND (convert(date, GETDATE()) <= ExpiresDate OR ExpiresDate IS NULL)
AND (convert(date, GETDATE()) >= PostDate OR PostDate IS NULL)

SELECT *,
imageIDs = (
    SELECT STRING_AGG(CAST(d.FSRowGuid AS VARCHAR(MAX)), ',')
    FROM AnnouncementDocument ad
    LEFT JOIN Document d ON d.ID = ad.DocumentID
    WHERE ad.AnnouncementID = a.ID
    GROUP BY ad.AnnouncementID)
FROM Announcement a
WHERE CompanyID = @_companyId
AND IsOn = 1
AND (convert(date, GETDATE()) <= ExpiresDate OR ExpiresDate IS NULL)
AND (convert(date, GETDATE()) >= PostDate OR PostDate IS NULL)
ORDER BY IsHighPriority DESC, ExpiresDate DESC, PostDate DESC
