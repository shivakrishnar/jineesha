declare @_companyId as nvarchar(max) ='@companyId';

SELECT JazzhrSecretKey  
FROM dbo.Company(NOLOCK)
WHERE ID =  CAST(@_companyId as bigint)