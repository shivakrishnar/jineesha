DECLARE @_companyId as int = @companyId, @_employeeId as int = @employeeId

SELECT (CASE WHEN EXISTS (SELECT * FROM Employee WHERE ID = @_employeeId and CompanyID = @_companyId)
THEN CAST(1 AS BIT)
ELSE CAST(0 AS BIT) END) as employeeExistsInCompany