select
    *
from
    dbo.Document
where
    ID = @id and
    CompanyID = @companyId