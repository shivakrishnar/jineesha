select
    ID,
    Filename
from
    dbo.Document
where
    CompanyID = @companyId