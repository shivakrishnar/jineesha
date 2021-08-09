DECLARE @_companyId as int = @companyId

SELECT (CASE WHEN EXISTS (SELECT * FROM Company WHERE ID = @_companyId)
THEN CAST(1 AS BIT)
ELSE CAST(0 AS BIT) END) as companyExistsInTenant